import { useRef } from 'react';
import { useInView } from '../lib/hooks';

export function GradientBackdrop() {
  const stage = useRef<HTMLDivElement>(null);
  const visible = useInView(stage);

  return (
    <div className="backdrop" aria-hidden="true">
      <div ref={stage} className="backdrop__stage" data-visible={visible}>
        <div className="backdrop__wash" />
      </div>
    </div>
  );
}
