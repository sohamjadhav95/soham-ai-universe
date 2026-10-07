import '@/styles/device.css';

export default function DeviceIframe({ src, title, bg }: { src: string; title: string; bg?: string }) {
  return (
    <div className="device-imac">
      <div className="imac-body">
        <div className="imac-screen" style={bg ? { background: bg } : undefined}>
          <iframe src={src} title={title} className="imac-iframe" />
        </div>
      </div>
      <div className="imac-chin">
        <div className="imac-logo" />
      </div>
      <div className="imac-stand" />
    </div>
  );
}
