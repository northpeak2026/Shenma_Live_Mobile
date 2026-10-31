import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { KeyboardInput, MobileScroll, useKeyboard } from "./mobile";
import { updatePredictionAssets, wheelApi, type WheelAssets } from "./luckyWheel";

type Choice = { label: string; odds: number; people: number; total: number };
type Prediction = { id: string; title: string; period: number; unit: "coins" | "diamonds"; minimum: number; status: "进行中" | "已开奖" | "无效竞猜"; pool: number; options: [Choice, Choice]; answer?: number };
type Bet = { id: string; roomId: string; prediction: Prediction; choice: number; amount: number; due: number; win: boolean; settled: boolean; shown: boolean; createdAt?: number; hostName?: string };
const presets = [10, 50, 100, 500];
const key = "shenma-prediction-bets";
export const readPredictionBets = (): Bet[] => { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } };
const label = (unit: Prediction["unit"]) => unit === "coins" ? "金币" : "钻石";
const seed = (roomId: string): Prediction[] => [
  { id: roomId+"-1", title: "这场比赛哪边会赢？", period: 12345, unit: "coins", minimum: 10, status: "进行中", pool: 1000, options: [{ label:"主队",odds:1.5,people:3,total:300 },{ label:"客队",odds:2,people:5,total:400 }] },
  { id: roomId+"-2", title: "双方进球数会超过3个吗？", period: 12346, unit: "diamonds", minimum: 10, status: "进行中", pool: 800, options: [{ label:"会",odds:2,people:4,total:200 },{ label:"不会",odds:1.5,people:6,total:450 }] },
  { id: roomId+"-3", title: "上半场是否有进球？", period: 12344, unit: "coins", minimum: 10, status: "已开奖", pool: 1500, answer: 0, options: [{ label:"有",odds:1.5,people:8,total:600 },{ label:"没有",odds:3,people:5,total:300 }] },
  { id: roomId+"-4", title: "本场是否出现点球？", period: 12343, unit: "diamonds", minimum: 10, status: "无效竞猜", pool: 300, options: [{ label:"是",odds:2,people:2,total:100 },{ label:"否",odds:1.5,people:3,total:200 }] },
];
export function LivePrediction({ roomId, active, replay, hostName, onOpenHistory }: { roomId: string; active: boolean; replay: boolean; hostName: string; onOpenHistory: () => void }) {
  const keyboard = useKeyboard();
  const [bets, setBets] = useState<Bet[]>(readPredictionBets);
  const [selected, setSelected] = useState<{ prediction: Prediction; choice: number } | null>(null);
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState(false);
  const [amountErrorAttempt, setAmountErrorAttempt] = useState(0);
  const [assets, setAssets] = useState<WheelAssets | null>(null);
  const [result, setResult] = useState<Bet | null>(null);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { const refresh = () => void wheelApi.assets().then(setAssets).catch(() => {}); refresh(); window.addEventListener("wheel-assets", refresh); return () => window.removeEventListener("wheel-assets", refresh); }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 2600); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => { localStorage.setItem(key, JSON.stringify(bets)); }, [bets]);
  useEffect(() => {
    const tick = async () => {
      const due = bets.find(b => b.roomId === roomId && !b.shown && b.due <= Date.now());
      if (!due || result || selected || busy) return;
      setBusy(true);
      try {
        if (due.win && !due.settled) await updatePredictionAssets(due.id+"-payout", due.prediction.unit, Math.floor(due.amount * due.prediction.options[due.choice].odds));
        setBets(current => current.map(b => b.id === due.id ? { ...b, settled:true, shown:true } : b));
        setResult(due);
      } catch { setToast("结算失败，请稍后重试"); }
      finally { setBusy(false); }
    };
    void tick(); const timer = setInterval(() => void tick(), 1000); return () => clearInterval(timer);
  }, [bets, roomId, result, selected, busy]);
  const submit = async () => {
    if (!selected || busy) return;
    const value = Number(amount), prediction = selected.prediction;
    if (!amount.trim()) { setAmountError(true); setAmountErrorAttempt(value => value + 1); return; }
    const existing = readPredictionBets().find(b => b.roomId === roomId && b.prediction.id === prediction.id);
    if (existing && existing.choice !== selected.choice) { setToast("该竞猜只能对已选选项加注"); return; }
    if (!Number.isSafeInteger(value) || value < prediction.minimum) { setToast(`最低下注 ${prediction.minimum}${label(prediction.unit)}`); return; }
    if (localStorage.getItem("shenma-login-state") === "signed-out") { setToast("请先登录"); return; }
    const createdAt = Date.now();
    const id = `prediction-${createdAt}-${Math.random().toString(36).slice(2)}`;
    setBusy(true);
    try {
      await updatePredictionAssets(id+"-stake", prediction.unit, -value);
      setBets(current => [...current, { id, roomId, prediction, hostName, createdAt, choice:selected.choice, amount:value, due:createdAt+10000+Math.floor(Math.random()*20001), win:Math.random()<0.5, settled:false, shown:false }]);
      keyboard.hide(); setSelected(null); setAmount(""); setToast("下注成功");
    } catch (error) { setToast(error instanceof Error ? error.message : "下注失败，请重试"); }
    finally { setBusy(false); }
  };
  return <section className="prediction-shell" hidden={!active}>
    <div className="prediction-history-entry"><button onClick={onOpenHistory}>竞猜历史 <span aria-hidden="true">›</span></button></div>
    <MobileScroll className="prediction-scroll"><div className="prediction-list">{seed(roomId).map(item => {
      const own = bets.filter(b => b.roomId === roomId && b.prediction.id === item.id);
      const chosen = own[0]?.choice;
      const unit = label(item.unit);
      return <article className="prediction-card" key={item.id}><header><h3>{item.title}</h3><span className={`prediction-status ${item.status === "进行中" ? "ongoing" : ""}`}>{item.status}</span></header><div className="prediction-meta"><span>第{item.period}期</span><span className="prediction-meta-values"><span>最低 <b>{item.minimum}{unit}</b></span><span>奖池 <b>{(item.pool + own.reduce((sum,b) => sum+b.amount,0)).toLocaleString()}{unit}</b></span></span></div><div className="prediction-options">{item.options.map((option,index) => { const placed=own.filter(b=>b.choice===index); return <button key={option.label} disabled={item.status !== "进行中" || replay || (chosen !== undefined && chosen !== index)} onClick={() => { keyboard.hide(); setAmount(""); setAmountError(false); setSelected({ prediction:item, choice:index }); }}><span className="prediction-option-top"><span><b>{option.label}</b>{item.answer === index && <em>正确答案</em>}</span><strong>{option.odds}倍</strong></span><small>{option.people+placed.length}人参与 · {(option.total+placed.reduce((sum,b)=>sum+b.amount,0)).toLocaleString()}{unit}</small>{placed.length > 0 && <span className="prediction-placed">已下注{placed.reduce((sum,b)=>sum+b.amount,0).toLocaleString()}{unit}，可继续追加</span>}</button>; })}</div></article>;
    })}</div></MobileScroll>
    <Dialog.Root open={!!selected} onOpenChange={open => { if (!open) { keyboard.hide(); setSelected(null); } }}><Dialog.Portal container={document.querySelector<HTMLElement>(".mobile-h5-container")}><Dialog.Overlay className="prediction-overlay"/><Dialog.Content className="prediction-dialog"><Dialog.Title>确认下注</Dialog.Title><Dialog.Description>{selected?.prediction.title}</Dialog.Description>{selected && <><p className="prediction-selected-choice">竞猜选项 <b>{selected.prediction.options[selected.choice].label} · {selected.prediction.options[selected.choice].odds}倍</b></p><p>当前余额 <b>{(localStorage.getItem("shenma-login-state")==="signed-out" ? 0 : assets?.[selected.prediction.unit] ?? 0).toLocaleString()}{label(selected.prediction.unit)}</b></p><strong>下注金额</strong><div className="prediction-presets">{presets.map(value=><button key={value} className={amount===String(value)?"active":""} onClick={()=>{keyboard.hide();setAmount(String(value));setAmountError(false);}}>{value}</button>)}</div><KeyboardInput key={amountErrorAttempt} className={amountError ? "prediction-amount-error" : ""} aria-invalid={amountError} value={amount} onChange={event=>{setAmount(event.target.value.replace(/\D/g,""));setAmountError(false);}} onBlur={()=>keyboard.hide()} inputMode="numeric" placeholder="输入下注金额" aria-label="下注金额"/><div className="prediction-actions"><button onClick={()=>{keyboard.hide();setSelected(null);}}>取消</button><button disabled={busy} onClick={()=>void submit()}>确认下注</button></div></>}</Dialog.Content></Dialog.Portal></Dialog.Root>
    <Dialog.Root open={!!result} onOpenChange={open=>{if(!open)setResult(null);}}><Dialog.Portal container={document.querySelector<HTMLElement>(".mobile-h5-container")}><Dialog.Overlay className="prediction-overlay"/><Dialog.Content className="prediction-dialog prediction-result"><Dialog.Title>{result?.win ? "🎉 竞猜获胜" : "竞猜未中"}</Dialog.Title><Dialog.Description>{result?.win ? "恭喜你猜对了！" : "很遗憾，下次再接再厉"}</Dialog.Description>{result && <><p>{result.prediction.title}</p><p>竞猜选项 <b>{result.prediction.options[result.choice].label}</b></p><p>下注金额 <b>{result.amount}{label(result.prediction.unit)}</b></p><p>派彩金额 <b>{result.win?Math.floor(result.amount*result.prediction.options[result.choice].odds):0}{label(result.prediction.unit)}</b></p></>}<button className="prediction-confirm" onClick={()=>setResult(null)}>知道了</button></Dialog.Content></Dialog.Portal></Dialog.Root>
    {toast && <div className="live-toast" role="status">{toast}</div>}
  </section>;
}
