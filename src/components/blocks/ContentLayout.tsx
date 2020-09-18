import { ReactNode } from 'react';

export default function ContentLayout(props: { children?: ReactNode }) {
  return (
    <div className="contentDetail">
      <style jsx>{`
        .contentDetail {
          max-width: 70em;
        }
      `}</style>
      {props.children}
    </div>
  );
}
