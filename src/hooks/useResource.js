import { useEffect, useState } from 'react';
export function useResource(loader, dependencies = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  useEffect(() => {
    const controller = new AbortController();
    setState(previous => ({ ...previous, loading: true, error: null }));
    loader(controller.signal).then(data => {
      if (!controller.signal.aborted) {
        setState({ data, loading: false, error: null });
      }
    }).catch(error => {
      if (!controller.signal.aborted && error.name !== 'AbortError') {
        setState({ data: null, loading: false, error });
      }
    });
    return () => controller.abort();
  }, dependencies);
  return state;
}
