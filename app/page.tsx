"use client";

import { useMemo, useState } from "react";

type Stop = {
  id: number;
  time: string;
  name: string;
  area: string;
  duration: string;
  cost: number;
  icon: string;
  note: string;
  x: number;
  y: number;
  kind: string;
};

type ChatMessage = { id: number; role: "user" | "ai"; text: string };
type ExpenseItem = { id: number; title: string; amount: number };
type KnowledgeSource = {
  id: number;
  icon: string;
  tone: string;
  name: string;
  description: string;
  status: string;
  action: string;
};

const INITIAL_STOPS: Stop[] = [
  { id: 1, time: "09:00", name: "灵隐寺", area: "西湖西侧", duration: "2小时", cost: 75, icon: "寺", note: "千年古刹与飞来峰石刻，清晨更安静。", x: 22, y: 28, kind: "文化古迹" },
  { id: 2, time: "11:40", name: "曲院风荷", area: "北山街", duration: "1小时", cost: 0, icon: "荷", note: "沿水而行，七月荷花正盛，适合慢游。", x: 45, y: 38, kind: "自然风光" },
  { id: 3, time: "13:10", name: "知味观·杨公堤店", area: "杨公堤", duration: "1小时", cost: 88, icon: "味", note: "尝试片儿川、东坡肉和定胜糕。", x: 59, y: 56, kind: "本地美食" },
  { id: 4, time: "15:00", name: "苏堤春晓", area: "西湖景区", duration: "1.5小时", cost: 0, icon: "桥", note: "六桥烟柳，下午光线适合散步拍照。", x: 72, y: 43, kind: "自然风光" },
  { id: 5, time: "18:20", name: "河坊街", area: "上城区", duration: "2小时", cost: 65, icon: "坊", note: "老街夜游，保留弹性，可按体力缩短。", x: 83, y: 70, kind: "街区漫游" },
];

const workflow = [
  ["01", "理解请求", "识别新增、替换、移时或删除"],
  ["02", "必要确认", "仅在意图不清时追问一次"],
  ["03", "检索候选", "知识库 + 高德地点与路线"],
  ["04", "最小改动", "锁定已完成与必去项目"],
  ["05", "约束校验", "检查时间、天气与剩余预算"],
  ["06", "确认更新", "展示差异，用户确认后写入"],
];

const INITIAL_SOURCES: KnowledgeSource[] = [
  { id: 1, icon: "高", tone: "amap", name: "高德地点与路线", description: "POI、周边搜索、坐标、出行时间与路线距离", status: "等待 API Key · 接口已预留", action: "配置" },
  { id: 2, icon: "册", tone: "doc", name: "全国目的地事实资料", description: "按旅程保存开放时间、预约方式、特色标签、来源和更新时间", status: "当前 1 个演示目的地 · 未接实时数据", action: "查看" },
  { id: 3, icon: "心", tone: "pref", name: "个人偏好记忆", description: "安静、当地菜、慢节奏、少排队；Agent 推断的新偏好需经你确认", status: "4 个演示偏好 · 可编辑或删除", action: "管理" },
  { id: 4, icon: "尺", tone: "rule", name: "行程约束与保护", description: "平台安全规则、用户自定规则和本次行程约束分层保存", status: "4 条可见规则 · 来源清晰", action: "编辑" },
];

export default function Home() {
  const [section, setSection] = useState<"trip" | "flow" | "knowledge">("trip");
  const [selected, setSelected] = useState(2);
  const [stops, setStops] = useState(INITIAL_STOPS);
  const [day, setDay] = useState(2);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [replying, setReplying] = useState(false);
  const [adjusted, setAdjusted] = useState(false);
  const [expense, setExpense] = useState(false);
  const [spent, setSpent] = useState(1220);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [saved, setSaved] = useState(false);
  const [flowEnabled, setFlowEnabled] = useState([true, true, true, true, true, true]);
  const [sources, setSources] = useState(INITIAL_SOURCES);
  const [editingSource, setEditingSource] = useState<KnowledgeSource | null>(null);
  const [sourceForm, setSourceForm] = useState({ name: "", description: "", status: "" });
  const [shareNotice, setShareNotice] = useState("");
  const current = stops.find((s) => s.id === selected) ?? stops[0];

  const total = useMemo(() => stops.reduce((sum, stop) => sum + stop.cost, 0), [stops]);

  function applyAdjustment() {
    if (adjusted) return;
    setStops((items) =>
      items.map((item) =>
        item.id === 4
          ? { ...item, time: "16:10", name: "茅家埠", area: "西里湖畔", icon: "茅", note: "更安静的湖湾与木栈道，替换较拥挤的苏堤中段。" }
          : item,
      ),
    );
    setSelected(4);
    setAdjusted(true);
  }

  function addExpense() {
    const amount = Number(expenseAmount);
    if (!expenseTitle.trim() || !Number.isFinite(amount) || amount <= 0) return;
    setExpenseItems((items) => [{ id: Date.now(), title: expenseTitle.trim(), amount }, ...items]);
    setSpent((value) => value + amount);
    setExpenseTitle("");
    setExpenseAmount("");
    setExpense(false);
  }

  function getLocalReply(input: string) {
    if (/吃|餐厅|饭|美食/.test(input)) return "按你当前在西湖西侧的位置，建议优先找步行 15 分钟内的杭帮菜。真实高德接口接入后，我会列出距离、评分和人均消费；目前先保留知味观，并预留 90 分钟用餐。";
    if (/天气|下雨|雨|热|高温/.test(input)) return "当前演示天气为“阵雨转阴”。建议把室外的茅家埠放到 16:10，午后阵雨时先用餐或进入室内。接入逐小时天气后，我会自动按未来 2—4 小时更新建议。";
    if (/预算|花|消费|记账/.test(input)) return `目前已记录 ¥${spent.toLocaleString()}，剩余 ¥${(3600 - spent).toLocaleString()}。你可以点击“记一笔”，输入消费事项和金额，我会立即更新预算。`;
    if (/不想|替换|换|人多|安静/.test(input)) return "我会遵守“最小改动”规则：只调整你指定的景点，保持已经完成、午餐和晚间安排不变。你可以告诉我想换掉哪个地点，以及更看重安静、距离还是景色。";
    return "收到。我已经把这条需求加入当前行程上下文。现在是本地交互模式；接入千问后，我会结合知识库、高德路线、预算和天气生成可执行的局部调整方案。";
  }

  async function sendMessage(text = chatInput) {
    const clean = text.trim();
    if (!clean || replying) return;
    const userMessage: ChatMessage = { id: Date.now(), role: "user", text: clean };
    setChatMessages((messages) => [...messages, userMessage]);
    setChatInput("");
    setReplying(true);
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    try {
      if (!apiBase) throw new Error("local-mode");
      const response = await fetch(`${apiBase}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thread_id: "demo-hangzhou", message: clean, location: "杭州西湖", budget_remaining: 3600 - spent }),
      });
      if (!response.ok) throw new Error("api-unavailable");
      const data = await response.json();
      setChatMessages((messages) => [...messages, { id: Date.now() + 1, role: "ai", text: data.reply }]);
    } catch {
      setChatMessages((messages) => [...messages, { id: Date.now() + 1, role: "ai", text: getLocalReply(clean) }]);
    } finally {
      setReplying(false);
    }
  }

  async function shareArchive() {
    const data = { title: "杭州三日漫游 · 旅行档案", text: "这是我在行迹生成的杭州旅行档案。", url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(`${data.title}\n${data.url}`);
        setShareNotice("分享链接已复制，可粘贴给微信好友");
        window.setTimeout(() => setShareNotice(""), 2500);
      }
    } catch {
      setShareNotice("已取消分享");
    }
  }

  function openSource(source?: KnowledgeSource) {
    if (source) {
      setEditingSource(source);
      setSourceForm({ name: source.name, description: source.description, status: source.status });
    } else {
      setEditingSource({ id: 0, icon: "＋", tone: "rule", name: "", description: "", status: "", action: "编辑" });
      setSourceForm({ name: "", description: "", status: "手动添加 · 本地资料" });
    }
  }

  function saveSource() {
    if (!editingSource || !sourceForm.name.trim()) return;
    if (editingSource.id === 0) {
      setSources((items) => [...items, { ...editingSource, id: Date.now(), name: sourceForm.name.trim(), description: sourceForm.description.trim() || "用户添加的旅行资料", status: sourceForm.status.trim(), icon: "资" }]);
    } else {
      setSources((items) => items.map((item) => item.id === editingSource.id ? { ...item, ...sourceForm } : item));
    }
    setEditingSource(null);
  }

  return (
    <main>
      <header className="topbar">
        <button className="brand" onClick={() => setSection("trip")} aria-label="回到行程">
          <span className="brand-mark">行</span>
          <span>行迹<span className="brand-dot">.</span></span>
        </button>
        <nav aria-label="主要导航">
          <button className={section === "trip" ? "active" : ""} onClick={() => setSection("trip")}>我的行程</button>
          <button className={section === "flow" ? "active" : ""} onClick={() => setSection("flow")}>Agent 工作流</button>
          <button className={section === "knowledge" ? "active" : ""} onClick={() => setSection("knowledge")}>知识库</button>
        </nav>
        <div className="top-actions">
          <button className="location"><span className="pulse" /> 杭州市 · 已定位</button>
          <button className="avatar" aria-label="个人中心">林</button>
        </div>
      </header>

      {section === "trip" && (
        <div className="trip-shell">
          <aside className="timeline-panel">
            <div className="trip-title">
              <p className="eyebrow">你的江南慢游计划</p>
              <h1>杭州三日漫游</h1>
              <div className="trip-meta"><span>7月18日—20日</span><span>2人</span><span>舒缓节奏</span></div>
            </div>

            <div className="day-tabs">
              {[1, 2, 3].map((item) => (
                <button key={item} className={day === item ? "active" : ""} onClick={() => setDay(item)}>
                  <small>DAY</small>{item}
                </button>
              ))}
            </div>

            {day !== 2 ? (
              <div className="other-day">
                <span>{day === 1 ? "抵达与城市初见" : "茶山与运河余韵"}</span>
                <h2>{day === 1 ? "西湖东岸 · 城市漫步" : "龙井村 · 大运河"}</h2>
                <p>这是演示行程的折叠日。切回 DAY 2 体验完整地图联动和实时调整。</p>
                <button onClick={() => setDay(2)}>查看核心演示日 →</button>
              </div>
            ) : (
              <>
                <div className="day-heading">
                  <div><p>7月19日 · 星期日</p><h2>湖西古意与烟柳</h2></div>
                  <span className="weather">☁ 27°<small>阵雨转阴</small></span>
                </div>
                <div className="stops">
                  {stops.map((stop, index) => (
                    <button key={stop.id} className={`stop ${selected === stop.id ? "active" : ""}`} onClick={() => setSelected(stop.id)}>
                      <span className="stop-time">{stop.time}</span>
                      <span className="stop-rail"><i>{index + 1}</i></span>
                      <span className="stop-body">
                        <strong>{stop.name}</strong>
                        <small>{stop.area} · {stop.duration}</small>
                      </span>
                      <span className="cost">{stop.cost ? `¥${stop.cost}` : "免费"}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="budget-card">
              <div className="budget-top"><span>旅行预算</span><strong>¥{spent.toLocaleString()} <small>/ ¥3,600</small></strong></div>
              <div className="bar"><i style={{ width: `${Math.min(100, (spent / 3600) * 100)}%` }} /></div>
              <div className="budget-foot"><span>剩余 ¥{(3600 - spent).toLocaleString()}</span><button onClick={() => setExpense(!expense)}>＋ 记一笔</button></div>
              {expense && (
                <div className="expense-form">
                  <label>消费事项<input value={expenseTitle} onChange={(event) => setExpenseTitle(event.target.value)} placeholder="例如：午餐、门票、打车" /></label>
                  <label>金额（元）<input value={expenseAmount} onChange={(event) => setExpenseAmount(event.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder="0.00" onKeyDown={(event) => event.key === "Enter" && addExpense()} /></label>
                  <div><button className="cancel-expense" onClick={() => setExpense(false)}>取消</button><button className="confirm-expense" disabled={!expenseTitle.trim() || !Number(expenseAmount)} onClick={addExpense}>确认记录</button></div>
                </div>
              )}
              {expenseItems.length > 0 && (
                <div className="expense-list">
                  {expenseItems.slice(0, 3).map((item) => <div key={item.id}><span>{item.title}</span><strong>− ¥{item.amount.toFixed(2)}</strong></div>)}
                </div>
              )}
            </div>
          </aside>

          <section className="map-panel" aria-label="交互式路线地图">
            <div className="map-grain" />
            <div className="lake lake-one" />
            <div className="lake lake-two" />
            <div className="road road-one" />
            <div className="road road-two" />
            <div className="road road-three" />
            <div className="map-label label-one">西 湖</div>
            <div className="map-label label-two">北 山 街</div>
            <div className="map-label label-three">杨 公 堤</div>
            <svg className="route-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path d="M22,28 C31,29 37,36 45,38 S52,47 59,56 S67,48 72,43 S78,58 83,70" />
            </svg>
            {stops.map((stop, index) => (
              <button
                key={stop.id}
                aria-label={`查看${stop.name}`}
                className={`map-marker ${selected === stop.id ? "active" : ""}`}
                style={{ left: `${stop.x}%`, top: `${stop.y}%` }}
                onClick={() => setSelected(stop.id)}
              >
                <span className="marker-art">{stop.icon}</span>
                <i>{index + 1}</i>
                <em>{stop.name}</em>
              </button>
            ))}
            <div className="current-pin"><span>⌖</span><em>你在这里</em></div>
            <div className="map-tools">
              <button aria-label="放大地图">＋</button><button aria-label="缩小地图">−</button><button aria-label="回到当前位置">⌖</button>
            </div>
            <div className="map-mode"><button className="active">路线</button><button>3D</button><button>卫星</button></div>

            <article className="place-card">
              <div className="place-visual" data-kind={current.kind}>
                <span>{current.icon}</span><small>沉浸预览</small>
              </div>
              <div className="place-info">
                <p>{current.kind} · {current.area}</p>
                <h3>{current.name}</h3>
                <p className="place-note">{current.note}</p>
                <div className="tags"><span>建议 {current.duration}</span><span>{current.cost ? `约 ¥${current.cost}/人` : "免费开放"}</span></div>
              </div>
              <button className="immersive" onClick={() => alert("360°沉浸预览将在接入景区授权素材后开放。")}>环看<br/><small>360°</small></button>
            </article>
          </section>

          <aside className={`copilot ${chatOpen ? "open" : ""}`}>
            <button className="chat-toggle" onClick={() => setChatOpen(!chatOpen)}>{chatOpen ? "×" : "问"}</button>
            <div className="copilot-head"><div className="ai-orb">✦</div><div><strong>随行 Agent</strong><small>正在关注位置、天气与预算</small></div></div>
            <div className="messages">
              <div className="msg user">苏堤下午人可能比较多，我想找一个安静点、景色类似的地方，但其他安排别动。</div>
              <div className="msg ai">
                <p>明白，我只调整下午这一个点。</p>
                <p>建议把 <b>苏堤春晓</b> 换成附近的 <b>茅家埠</b>：同样临湖、有木栈道和水岸景观，通常更安静。</p>
                <div className="change-preview"><span>仅 1 处变化</span><del>15:00 苏堤春晓</del><ins>16:10 茅家埠</ins><small>午餐与晚上的河坊街保持不变</small></div>
                <button className={adjusted ? "applied" : "apply"} onClick={applyAdjustment}>{adjusted ? "✓ 已更新行程" : "应用这次调整"}</button>
              </div>
              {chatMessages.map((message) => (
                <div key={message.id} className={`msg ${message.role}`}>{message.text}</div>
              ))}
              {replying && <div className="msg ai typing"><span /><span /><span /></div>}
            </div>
            <div className="suggestions">
              <button onClick={() => sendMessage("附近吃什么？")}>附近吃什么？</button>
              <button onClick={() => { setExpense(true); setChatOpen(false); }}>记录消费</button>
              <button onClick={() => sendMessage("根据天气调整接下来的行程")}>根据天气调整</button>
            </div>
            <div className="composer">
              <input aria-label="向随行 Agent 提问" value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && sendMessage()} placeholder="告诉我你的临时想法…" />
              <button aria-label="发送" disabled={!chatInput.trim() || replying} onClick={() => sendMessage()}>↑</button>
            </div>
            <div className="minimal-rule">已启用「最小改动」保护 · 今日预计 ¥{total}</div>
          </aside>
        </div>
      )}

      {section === "flow" && (
        <section className="studio">
          <div className="studio-head">
            <div><p className="eyebrow">可编辑 Agent 编排</p><h1>旅行调整工作流</h1><p>每个步骤都可以启停和修改，发布后 Agent 将按这条路径处理突发变化。</p></div>
            <div className="studio-actions"><span>{saved ? "✓ 已保存" : "草稿已自动保存"}</span><button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1800); }}>保存并启用</button></div>
          </div>
          <div className="flow-canvas">
            <div className="flow-start">用户提出临时变化</div>
            <div className="flow-grid">
              {workflow.map((node, index) => (
                <div className={`flow-node ${flowEnabled[index] ? "" : "disabled"}`} key={node[0]}>
                  <div className="node-top"><span>{node[0]}</span><label><input type="checkbox" checked={flowEnabled[index]} onChange={() => setFlowEnabled((v) => v.map((x, i) => i === index ? !x : x))}/><i /></label></div>
                  <h3 contentEditable suppressContentEditableWarning>{node[1]}</h3>
                  <p contentEditable suppressContentEditableWarning>{node[2]}</p>
                  <div className="node-tools">{index === 2 ? "高德 LBS · 景点知识库" : index === 4 ? "天气 · 预算计算器" : "千问 · 状态记忆"}</div>
                  {index < workflow.length - 1 && <b className="connector">↓</b>}
                </div>
              ))}
            </div>
            <div className="flow-end">生成局部变更补丁 · 等待用户确认</div>
          </div>
          <div className="guardrails">
            <h2>行程保护规则</h2>
            <div><span>锁定已完成项目</span><b>始终开启</b></div>
            <div><span>单次最多替换</span><b>1 个景点</b></div>
            <div><span>单次最多新增</span><b>2 个景点</b></div>
            <div><span>整体重排</span><b>需用户明确同意</b></div>
          </div>
        </section>
      )}

      {section === "knowledge" && (
        <section className="knowledge">
          <div className="studio-head">
            <div><p className="eyebrow">Agent 的可靠依据</p><h1>旅行知识库</h1><p>把事实、偏好和约束分开保存，避免 Agent 凭感觉重写路线。</p></div>
            <button className="add-source" onClick={() => openSource()}>＋ 添加资料</button>
          </div>
          <div className="knowledge-stats">
            <div><small>实时地点数据</small><strong>未连接</strong><span>接入高德后显示真实查询数</span></div>
            <div><small>可见保护规则</small><strong>4</strong><span>平台 1 · 用户 2 · 行程 1</span></div>
            <div><small>已确认偏好</small><strong>4</strong><span>当前均为演示偏好</span></div>
            <div><small>旅行档案</small><strong>1</strong><span>演示 1 · 真实 0</span></div>
          </div>
          <div className="archive-heading"><p className="eyebrow">按旅程沉淀，而不是按城市写死</p><h2>我的旅行档案</h2><p>旅行结束后，将真实路线、消费、反馈和已核验地点整理成可分享的档案。</p></div>
          <div className="archive-grid">
            <article className="archive-card"><div><span className="demo-badge">演示档案</span><h3>杭州三日漫游</h3><p>5 个地点 · 1 次局部调整 · 当前预算记录 ¥{spent.toLocaleString()}</p><small>接入账号数据库后才会永久保存</small></div><button onClick={shareArchive}>分享给好友</button></article>
            <article className="archive-card empty"><div><h3>下一次旅行会出现在这里</h3><p>支持全国目的地，每段旅行独立生成事实与记忆。</p></div></article>
          </div>
          {shareNotice && <div className="share-notice">{shareNotice}</div>}
          <div className="archive-heading"><p className="eyebrow">Agent 的数据来源</p><h2>知识与规则</h2></div>
          <div className="source-grid">
            {sources.map((source) => (
              <article key={source.id}>
                <span className={`source-icon ${source.tone}`}>{source.icon}</span>
                <div><h3>{source.name}</h3><p>{source.description}</p><small>{source.status}</small></div>
                <button onClick={() => openSource(source)}>{source.action}</button>
              </article>
            ))}
          </div>
          <div className="knowledge-note"><span>✦</span><div><strong>知识库如何参与一次调整？</strong><p>Agent 先理解你的意图，再用知识库筛选真实候选，随后调用地图计算路程，最后由规则引擎只生成必要的行程补丁。</p></div></div>
          {editingSource && (
            <div className="modal-backdrop" role="presentation" onMouseDown={() => setEditingSource(null)}>
              <div className="source-modal" role="dialog" aria-modal="true" aria-label={editingSource.id === 0 ? "添加资料" : "编辑资料"} onMouseDown={(event) => event.stopPropagation()}>
                <div className="modal-head"><div><p className="eyebrow">旅行知识库</p><h2>{editingSource.id === 0 ? "添加一份资料" : "查看与编辑"}</h2></div><button onClick={() => setEditingSource(null)}>×</button></div>
                <label>资料名称<input autoFocus value={sourceForm.name} onChange={(event) => setSourceForm((form) => ({ ...form, name: event.target.value }))} placeholder="例如：杭州小众景点清单" /></label>
                <label>内容说明<textarea value={sourceForm.description} onChange={(event) => setSourceForm((form) => ({ ...form, description: event.target.value }))} placeholder="填写资料内容、适用场景或来源说明" /></label>
                <label>状态或备注<input value={sourceForm.status} onChange={(event) => setSourceForm((form) => ({ ...form, status: event.target.value }))} placeholder="例如：手动整理 · 20 条" /></label>
                <div className="modal-actions">
                  {editingSource.id !== 0 && <button className="delete-source" onClick={() => { setSources((items) => items.filter((item) => item.id !== editingSource.id)); setEditingSource(null); }}>删除资料</button>}
                  <button className="secondary" onClick={() => setEditingSource(null)}>取消</button>
                  <button className="primary" disabled={!sourceForm.name.trim()} onClick={saveSource}>保存资料</button>
                </div>
                <p className="modal-hint">当前保存在本次浏览器会话中；接入数据库后会同步到账号知识库。</p>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

