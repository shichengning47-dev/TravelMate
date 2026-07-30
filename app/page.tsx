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

export default function Home() {
  const [section, setSection] = useState<"trip" | "flow" | "knowledge">("trip");
  const [selected, setSelected] = useState(2);
  const [stops, setStops] = useState(INITIAL_STOPS);
  const [day, setDay] = useState(2);
  const [chatOpen, setChatOpen] = useState(true);
  const [adjusted, setAdjusted] = useState(false);
  const [expense, setExpense] = useState(false);
  const [spent, setSpent] = useState(1220);
  const [saved, setSaved] = useState(false);
  const [flowEnabled, setFlowEnabled] = useState([true, true, true, true, true, true]);
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
                <div className="expense-row">
                  <span>午餐 · ¥88</span>
                  <button onClick={() => { setSpent((v) => v + 88); setExpense(false); }}>确认记录</button>
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
            </div>
            <div className="suggestions"><button>附近吃什么？</button><button>记录消费</button><button>根据天气调整</button></div>
            <div className="composer"><input aria-label="向随行 Agent 提问" placeholder="告诉我你的临时想法…" /><button aria-label="发送">↑</button></div>
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
            <button className="add-source">＋ 添加资料</button>
          </div>
          <div className="knowledge-stats">
            <div><small>景点与餐厅</small><strong>1,284</strong><span>高德地点数据</span></div>
            <div><small>旅行规则</small><strong>36</strong><span>营业与预约提醒</span></div>
            <div><small>你的偏好</small><strong>12</strong><span>随反馈持续更新</span></div>
            <div><small>行程记忆</small><strong>8</strong><span>本次旅行的变化</span></div>
          </div>
          <div className="source-grid">
            <article><span className="source-icon amap">高</span><div><h3>高德地点与路线</h3><p>POI、周边搜索、坐标、出行时间与路线距离</p><small>等待 API Key · 接口已预留</small></div><button>配置</button></article>
            <article><span className="source-icon doc">册</span><div><h3>杭州旅行事实库</h3><p>开放时间、预约方式、特色标签与建议停留时长</p><small>演示数据 · 128 条</small></div><button>查看</button></article>
            <article><span className="source-icon pref">心</span><div><h3>个人偏好记忆</h3><p>安静、当地菜、慢节奏、少排队，自动从反馈中更新</p><small>已启用 · 用户可随时删除</small></div><button>管理</button></article>
            <article><span className="source-icon rule">尺</span><div><h3>行程约束与保护</h3><p>必去、可替换、已完成、时间窗和预算上限</p><small>6 条规则正在生效</small></div><button>编辑</button></article>
          </div>
          <div className="knowledge-note"><span>✦</span><div><strong>知识库如何参与一次调整？</strong><p>Agent 先理解你的意图，再用知识库筛选真实候选，随后调用地图计算路程，最后由规则引擎只生成必要的行程补丁。</p></div></div>
        </section>
      )}
    </main>
  );
}

