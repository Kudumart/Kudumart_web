import { useEffect, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { accountApi } from '../api/account';
import { Button, EmptyState, Skeleton } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { useResource } from '../hooks/useResource';
import './Messages.css';

export default function Messages() {
  const { user, notify } = useApp();
  const [activeId, setActiveId] = useState('');
  const [revision, setRevision] = useState(0);
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const conversationsResource = useResource(signal => user ? accountApi.conversations(signal) : Promise.resolve([]), [user?.id, revision]);
  const conversations = Array.isArray(conversationsResource.data) ? conversationsResource.data : [];
  useEffect(() => { if (!activeId && conversations[0]?.id) setActiveId(conversations[0].id); }, [activeId, conversations]);
  const active = conversations.find(item => item.id === activeId);
  const messagesResource = useResource(signal => activeId ? accountApi.messages(activeId, signal) : Promise.resolve(null), [activeId, revision]);
  const messages = messagesResource.data?.message || [];
  const other = active ? (active.senderId === user?.id ? active.receiverUser : active.senderUser) : null;

  const send = async event => {
    event.preventDefault();
    const text = content.trim();
    if (!text || !active || !other) return;
    setBusy(true);
    try { await accountApi.sendMessage({ productId: active.productId, receiverId: other.id, content: text }); setContent(''); setRevision(value => value + 1); }
    catch (error) { notify(error.message, 'error'); }
    finally { setBusy(false); }
  };

  if (!user) return <Navigate to="/login" replace state={{ from: '/account/messages' }}/>;
  return <div className="container messages-page"><div className="page-intro"><span className="eyebrow">CONVERSATIONS</span><h1>Messages.</h1><p>Keep product questions and seller replies together.</p></div>{conversationsResource.loading ? <Skeleton className="messages-skeleton"/> : conversationsResource.error ? <EmptyState icon={MessageCircle} title="Messages couldn’t be loaded" description={conversationsResource.error.message}/> : !conversations.length ? <EmptyState icon={MessageCircle} title="No conversations yet" description="Use Contact seller on a product to start a conversation."/> : <div className="messenger"><aside className="messenger__list">{conversations.map(item => { const person = item.senderId === user.id ? item.receiverUser : item.senderUser; const last = item.message?.[0]; return <button className={item.id === activeId ? 'active' : ''} onClick={() => setActiveId(item.id)} key={item.id}><span className="messenger__avatar">{person?.photo ? <img src={person.photo} alt=""/> : <MessageCircle size={20}/>}</span><span><strong>{[person?.firstName, person?.lastName].filter(Boolean).join(' ') || 'Seller'}</strong><small>{item.product?.name}</small><em>{last?.content || 'Open conversation'}</em></span>{Number(item.unreadMessagesCount) > 0 && <b>{item.unreadMessagesCount}</b>}</button>; })}</aside><section className="messenger__thread"><header><div><strong>{[other?.firstName, other?.lastName].filter(Boolean).join(' ') || 'Seller'}</strong><span>{active?.product?.name}</span></div></header><div className="messenger__messages">{messagesResource.loading ? <Skeleton className="messages-skeleton"/> : messages.map(message => <div className={`message-bubble ${message.userId === user.id ? 'message-bubble--mine' : ''}`} key={message.id}><p>{message.content}</p><small>{new Date(message.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</small></div>)}</div><form className="messenger__composer" onSubmit={send}><textarea value={content} onChange={event => setContent(event.target.value)} maxLength="2000" rows="2" placeholder="Write a message…" aria-label="Message"/><Button type="submit" icon={Send} loading={busy} disabled={!content.trim()}>Send</Button></form></section></div>}</div>;
}
