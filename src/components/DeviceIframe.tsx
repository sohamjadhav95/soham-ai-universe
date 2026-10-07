import '@/styles/device.css';

export default function DeviceIframe({ src, title, bg }: { src: string; title: string; bg?: string }) {
  return (
    <div className="monitor-stage">
      <div className="monitor">
        <div className="monitor-screen" style={bg ? { background: bg } : undefined}>
          <iframe src={src} title={title} className="monitor-iframe" />
        </div>
        <div className="monitor-neck" />
        <div className="monitor-base" />
      </div>
    </div>
  );
}
