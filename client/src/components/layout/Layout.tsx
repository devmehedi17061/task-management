import type { ReactNode } from 'react';
import { Sidebar, type View } from './Sidebar';

interface Props {
  view: View;
  onChangeView: (v: View) => void;
  children: ReactNode;
}

export function Layout({ view, onChangeView, children }: Props) {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar view={view} onChange={onChangeView} />
      <main className="flex-1 overflow-auto bg-canvas p-5 scrollbar-thin">{children}</main>
    </div>
  );
}
