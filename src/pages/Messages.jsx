import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ExternalLink, MessageCircle, Send } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { accountApi } from '../api/account';
import { Button, EmptyState, Skeleton } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { useResource } from '../hooks/useResource';
import './Messages.css';

const personName = person => [person?.firstName, person?.lastName].filter(Boolean).join(' ') || 'KuduMart user';

export default function Messages() {
  const { user, notify } = useApp();
  const [activeId, setActiveId] = useState('');
  const [revision, setRevision] = useState(0);
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [threadOpen, setThreadOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => new Set());
  const messageEnd = useRef(null);
  const conversationsResource = useResource(signal => user ? accountApi.conversations(signal) : Promise.resolve([]), [user?.id, revision]);
  const conversations = Array.isArray(conversationsResource.data) ? conversationsResource.data : [];
  useEffect(() => { if (!activeId && conversations[0]?.id) setActiveId(conversations[0].id); }, [activeId, conversations]);
  const active = conversations.find(item => item.id === activeId);
  const messagesResource = useResource(signal => activeId ? accountApi.messages(activeId, signal) : Promise.resolve(null), [activeId, revision]);
  const messages = messagesResource.data?.message || [];
  const other = active ? (active.senderId === user?.id ? active.receiverUser : active.senderUser) : null;

  useEffect(() => {
    if (!messagesResource.loading && activeId && messagesResource.data) {
      setReadIds(ids => new Set([...ids, activeId]));
    }
  }, [activeId, messagesResource.loading, messagesResource.data]);
  useEffect(() => { messageEnd.current?.scrollIntoView({ block: 'end' }); }, [activeId, messages.length]);

  const chooseConversation = id => {
    setActiveId(id);
    setReadIds(ids => new Set([...ids, id]));
    setThreadOpen(true);
  };

  const send = async event => {
    event.preventDefault();
    const text = content.trim();
    if (!text || !active || !other || busy) return;
    setBusy(true);
    try {
      await accountApi.sendMessage({ productId: active.productId, receiverId: other.id, content: text });
      setContent('');
      setRevision(value => value + 1);
    } catch (error) { notify(error.message, 'error'); }
    finally { setBusy(false); }
  };

  if (!user) return <Navigate to="/login" replace state={{ from: '/account/messages' }}/>;
  return <div className="container messages-page">
    <div className="page-intro"><span className="eyebrow">CONVERSATIONS</span><h1>Messages.</h1><p>Keep product questions and seller replies together.</p></div>
    {conversationsResource.loading ? <Skeleton className="messages-skeleton"/> : conversationsResource.error ? <EmptyState icon={MessageCircle} title="Messages couldn’t be loaded" description={conversationsResource.error.message} action={<Button variant="outline" onClick={() => setRevision(value => value + 1)}>Try again</Button>}/> : !conversations.length ? <EmptyState icon={MessageCircle} title="No conversations yet" description="Use Contact seller on a product to start a conversation." action={<Link to="/catalog"><Button>Explore products</Button></Link>}/> : <div className={`messenger ${threadOpen ? 'messenger--thread-open' : ''}`}>
      <aside className="messenger__list" aria-label="Conversations">{conversations.map(item => {
        const person = item.senderId === user.id ? item.receiverUser : item.senderUser;
        const last = item.message?.[0];
        const unread = readIds.has(item.id) ? 0 : Number(item.unreadMessagesCount || 0);
        return <button type="button" className={item.id === activeId ? 'active' : ''} onClick={() => chooseConversation(item.id)} key={item.id}>
          <span className="messenger__avatar">{person?.photo ? <img src={person.photo} alt=""/> : <MessageCircle size={20}/>}</span>
          <span><strong>{personName(person)}</strong><small>{item.product?.name}</small><em>{last?.content || (last?.fileUrl ? 'Attachment' : 'Open conversation')}</em></span>
          {unread > 0 && <b aria-label={`${unread} unread messages`}>{unread > 99 ? '99+' : unread}</b>}
        </button>;
      })}</aside>
      <section className="messenger__thread">
        <header><button type="button" className="messenger__back" aria-label="Back to conversations" onClick={() => setThreadOpen(false)}><ArrowLeft size={19}/></button><div><strong>{personName(other)}</strong>{active?.product?.id ? <Link to={`/product/${active.product.id}`}>{active.product.name}<ExternalLink size={12}/></Link> : <span>{active?.product?.name}</span>}</div></header>
        <div className="messenger__messages">{messagesResource.loading ? <Skeleton className="messages-skeleton"/> : messagesResource.error ? <EmptyState icon={MessageCircle} title="Conversation couldn’t be loaded" description={messagesResource.error.message} action={<Button size="sm" variant="outline" onClick={() => setRevision(value => value + 1)}>Try again</Button>}/> : messages.length ? messages.map(message => <div className={`message-bubble ${message.userId === user.id ? 'message-bubble--mine' : ''}`} key={message.id}><p>{message.content}</p>{message.fileUrl && <a href={message.fileUrl} target="_blank" rel="noreferrer">View attachment</a>}<small>{new Date(message.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</small></div>) : <div className="messenger__empty-thread"><MessageCircle size={25}/><p>No messages in this conversation yet.</p></div>}<span ref={messageEnd}/></div>
        <form className="messenger__composer" onSubmit={send}><div><textarea value={content} onChange={event => setContent(event.target.value)} maxLength="2000" rows="2" placeholder="Write a message…" aria-label="Message"/><small>{content.length}/2000</small></div><Button type="submit" icon={Send} loading={busy} disabled={!content.trim() || messagesResource.loading}>Send</Button></form>
      </section>
    </div>}
  </div>;
}
