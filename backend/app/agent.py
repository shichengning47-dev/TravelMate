from typing import TypedDict
from langgraph.graph import END, START, StateGraph
from langchain_openai import ChatOpenAI
from .config import get_settings


class AgentState(TypedDict):
    message: str
    location: str | None
    budget_remaining: float | None
    intent: str
    reply: str


def build_graph():
    settings = get_settings()

    async def understand(state: AgentState):
        text = state["message"]
        intent = "replan" if any(word in text for word in ("不想去", "人多", "替换", "换一个")) else "assist"
        return {"intent": intent}

    async def respond(state: AgentState):
        if not settings.dashscope_api_key:
            return {"reply": "后端已就绪，但尚未配置千问 API Key。配置后我会结合位置、预算、天气与保护规则生成真实建议。"}
        model = ChatOpenAI(
            model=settings.qwen_model,
            api_key=settings.dashscope_api_key,
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
            temperature=0.2,
        )
        system = (
            "你是中国境内旅行随行Agent。必须优先做最小改动：锁定已完成和用户指定不动的项目；"
            "意图不清时先区分用户是彻底不想去，还是只想避开拥挤；输出建议和变更差异，未经确认不得写入行程。"
        )
        result = await model.ainvoke([
            ("system", system),
            ("human", f"当前位置：{state.get('location') or '未知'}；剩余预算：{state.get('budget_remaining') or '未知'}；用户说：{state['message']}"),
        ])
        return {"reply": str(result.content)}

    graph = StateGraph(AgentState)
    graph.add_node("understand", understand)
    graph.add_node("respond", respond)
    graph.add_edge(START, "understand")
    graph.add_edge("understand", "respond")
    graph.add_edge("respond", END)
    return graph.compile()

