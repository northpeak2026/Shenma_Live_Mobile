import { Fragment, useState, type ReactNode } from 'react';
import requirements from '../docs/requirements/SMLive产品需求.md?raw';
import { useKeyboard } from './mobile';

// Render the document's Markdown subset as React nodes: raw HTML is never executed.
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(#[^)]+\))/g).map((part, i) => {
    if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>;
    const link = part.match(/^\[([^\]]+)\]\((#[^)]+)\)$/);
    if (link) return <a key={i} href={link[2]} onClick={(e) => { e.preventDefault(); document.getElementById(link[2].slice(1))?.scrollIntoView({ block: 'start' }); }}>{link[1]}</a>;
    return part;
  });
}
const lines = requirements.replace(/\r/g, '').split('\n');
const headings: { title: string; level: number; id: string; line: number }[] = [];
const usedIds = new Map<string, number>();
lines.forEach((line, index) => {
  const match = line.match(/^(#{1,4}) (.+)$/);
  if (!match) return;
  const number = match[2].match(/^\d+(?:\.\d+)*/)?.[0];
  const base = number ? `section-${number}` : `heading-${index}`;
  const count = usedIds.get(base) ?? 0;
  usedIds.set(base, count + 1);
  headings.push({ title: match[2], level: match[1].length, id: count ? `${base}-${count}` : base, line: index });
});
function renderMarkdown() {
  const nodes: ReactNode[] = [];
  let i = 0;
  const cells = (line: string) => line.trim().replace(/^\||\|$/g, '').split('|').map(s => s.trim());
  while (i < lines.length) {
    const line = lines[i]; const key = i;
    if (!line.trim()) { i++; continue; }
    const heading = headings.find(h => h.line === i);
    if (heading) {
      const Tag = `h${heading.level}` as 'h1' | 'h2' | 'h3' | 'h4';
      nodes.push(<Tag key={key} id={heading.id} tabIndex={-1}>{inline(heading.title)}</Tag>); i++; continue;
    }
    if (/^---+$/.test(line.trim())) { nodes.push(<hr key={key} />); i++; continue; }
    if (line.startsWith('|') && /^\|[\s:|-]+\|$/.test(lines[i + 1] ?? '')) {
      const headers = cells(line); i += 2; const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(cells(lines[i++]));
      nodes.push(<div className="requirements-table" key={key}><table><thead><tr>{headers.map((cell, j) => <th key={j}>{inline(cell)}</th>)}</tr></thead><tbody>{rows.map((row, j) => <tr key={j}>{row.map((cell, k) => <td key={k}>{inline(cell)}</td>)}</tr>)}</tbody></table></div>); continue;
    }
    const list = line.match(/^(- |\d+\. )/);
    if (list) {
      const ordered = list[1] !== '- '; const items: string[] = [];
      const pattern = ordered ? /^\d+\. / : /^- /;
      while (i < lines.length && pattern.test(lines[i])) items.push(lines[i++].replace(pattern, ''));
      const Tag = ordered ? 'ol' : 'ul';
      nodes.push(<Tag key={key}>{items.map((item, j) => <li key={j}>{inline(item)}</li>)}</Tag>); continue;
    }
    const paragraph: string[] = [line.trim()]; i++;
    while (i < lines.length && lines[i].trim() && !/^(#{1,4} |\||- |\d+\. |---)/.test(lines[i])) paragraph.push(lines[i++].trim());
    nodes.push(<p key={key}>{inline(paragraph.join(' '))}</p>);
  }
  return nodes;
}
const documentNodes = renderMarkdown();

export function RequirementsMode({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'prototype' | 'document'>('prototype');
  const [toc, setToc] = useState(false);
  const keyboard = useKeyboard();
  return <>
    <div className="mode-toolbar"><div className="mode-radio-group" role="radiogroup" aria-label="浏览模式">
      {(['prototype', 'document'] as const).map(value => <label key={value} className="mode-radio-option">
        <input type="radio" name="shenma-view-mode" value={value} checked={mode === value} onChange={() => { keyboard.hide(); setMode(value); }} />
        <span>{value === 'prototype' ? '原型模式' : '文档模式'}</span>
      </label>)}
    </div></div>
    <div className="prototype-preserved">{children}</div>
    {mode === 'document' && <section className="requirements-view" aria-label="神马直播产品需求文档">
      <header className="requirements-header"><div><span>产品需求文档</span><b>神马直播产品需求文档</b></div><button aria-expanded={toc} aria-controls="requirements-toc" onClick={() => setToc(!toc)}>目录 {toc ? '−' : '＋'}</button></header>
      <div className="requirements-layout"><nav id="requirements-toc" className={`requirements-toc ${toc ? 'is-open' : ''}`} aria-label="文档目录"><b>文档目录</b>{headings.filter(h => h.level === 2 || h.level === 3).map(h => <a key={h.id} className={h.level === 3 ? 'nested' : ''} href={`#${h.id}`} onClick={e => { e.preventDefault(); document.getElementById(h.id)?.scrollIntoView({ block: 'start' }); document.getElementById(h.id)?.focus({ preventScroll: true }); setToc(false); }}>{h.title}</a>)}</nav>
        <article className="requirements-body"><Fragment>{documentNodes}</Fragment><p className="requirements-end">— 文档结束 —</p></article></div>
    </section>}
  </>;
}
