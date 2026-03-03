import EarthLoader from "./EarthLoader";

const PageLoader = () => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background">
    <EarthLoader text="Connecting..." />
  </div>
);

export default PageLoader;
