import { useRef, useState } from 'react';
import { Gavel, ImagePlus, Package, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sellerApi, uploadSellerImage } from '../../api/seller';
import { Button, Modal } from '../../components/ui';

export const AI_PRODUCT_KEY = 'ai_product_data';

/** Reads and clears the AI-generated listing draft left by the creator. */
export function takeAiDraft() {
  try {
    const raw = sessionStorage.getItem(AI_PRODUCT_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(AI_PRODUCT_KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1]);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

/** Upload a photo and let AI draft the listing; the seller reviews it in the normal form. */
export default function AIProductCreator({ onClose }) {
  const navigate = useNavigate();
  const input = useRef(null);
  const [type, setType] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = event => {
    const chosen = event.target.files?.[0];
    if (!chosen) return;
    setFile(chosen);
    setError('');
    setPreview(URL.createObjectURL(chosen));
  };

  const analyse = async () => {
    if (!file) { setError('Please upload a product image first.'); return; }
    setBusy(true);
    setError('');
    try {
      const [imageBase64, imageUrl] = await Promise.all([toBase64(file), uploadSellerImage(file).catch(() => '')]);
      const draft = await sellerApi.aiGenerateProduct({ imageBase64, mimeType: file.type });
      sessionStorage.setItem(AI_PRODUCT_KEY, JSON.stringify({ ...draft, imagePreview: imageUrl }));
      onClose();
      navigate(type === 'auction' ? '/seller/auctions/new?ai=1' : '/seller/products/new?ai=1');
    } catch (failure) {
      setError(failure.message || 'We couldn’t analyse that image. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return <Modal title="Create a listing with AI" icon={Sparkles} onClose={() => !busy && onClose()} footer={type ? <><Button variant="ghost" disabled={busy} onClick={() => { setType(''); setFile(null); setPreview(''); }}>Back</Button><Button loading={busy} disabled={!file} onClick={analyse}>{busy ? 'Analysing…' : 'Analyse image'}</Button></> : null}>
    {!type ? <div className="seller-ai-types">
      <p>Upload a product photo and AI will fill in the listing for you. What are you listing?</p>
      <button type="button" onClick={() => setType('regular')}><Package size={22}/><strong>Fixed-price product</strong><small>Sell at a set price</small></button>
      <button type="button" onClick={() => setType('auction')}><Gavel size={22}/><strong>Auction</strong><small>Let buyers bid</small></button>
    </div> : <div className="seller-ai-upload">
      <p>Upload a clear photo of your {type === 'auction' ? 'auction' : 'fixed-price'} product.</p>
      <button type="button" className="seller-upload" onClick={() => input.current?.click()}>{preview ? <img src={preview} alt="Product preview"/> : <><ImagePlus size={26}/><strong>Choose an image</strong></>}</button>
      <input ref={input} type="file" accept="image/*" hidden onChange={pick}/>
      {error && <div className="form-alert" role="alert">{error}</div>}
    </div>}
  </Modal>;
}
