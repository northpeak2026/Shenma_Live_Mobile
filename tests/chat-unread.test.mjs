import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
const source = fs.readFileSync(new URL('../src/Prototype.tsx', import.meta.url), 'utf8');
const model = source.slice(source.indexOf('const conversations ='), source.indexOf('const formatNumber ='));
let stored = null;
globalThis.localStorage = { getItem() { return stored; } };
const { readChatConversations, unreadLabel } = await import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(model + '\nexport { readChatConversations, unreadLabel };', {mode:'transform'})).toString('base64')}`);
test('unread counts derive from conversation messages and preserve read state across reloading', () => {
 stored = null; const initial = readChatConversations(); assert.ok(initial.reduce((sum,item)=>sum+item.unreadCount,0)>0);
 stored = JSON.stringify(Object.fromEntries(initial.map((item)=>[item.id,0])));assert.equal(readChatConversations().reduce((sum,item)=>sum+item.unreadCount,0),0);
 stored = JSON.stringify({[initial[0].id]:105}); assert.equal(unreadLabel(readChatConversations()[0].unreadCount),'99+');
});
test('corrupt persistence falls back safely, and badge text handles boundary counts',()=>{
 stored='invalid'; assert.ok(readChatConversations().length>0);
 stored=JSON.stringify({'service-rain':-1}); assert.ok(readChatConversations()[0].unreadCount>=0);
 assert.equal(unreadLabel(1),'1');assert.equal(unreadLabel(99),'99');assert.equal(unreadLabel(100),'99+');
});
