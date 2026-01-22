import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Dashboard } from "./Dashboard";
import { Partners } from "./Partners";
import { Interactions } from "./Interactions";
import { Threads } from "./Threads";
import { PartnerProfileView } from "@/components/partners/PartnerProfileView";
import { InteractionModalProvider } from "@/contexts/InteractionModalContext";
import { LogInteractionModal } from "@/components/interactions/LogInteractionModal";

const Index = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash?.replace("#", "");
    return hash && hash.startsWith("/") ? hash : "/";
  });
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash?.replace("#", "");
      const next = hash && hash.startsWith("/") ? hash : "/";
      setCurrentPath(next);
      setSelectedPartnerId(null);
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const handleNavigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    setSelectedPartnerId(null);
  };

  const handleSelectPartner = (partnerId: string) => setSelectedPartnerId(partnerId);
  const handleBackFromPartner = () => setSelectedPartnerId(null);

  const renderPage = () => {
    if (selectedPartnerId) {
      return <PartnerProfileView partnerId={selectedPartnerId} onBack={handleBackFromPartner} />;
    }

    switch (currentPath) {
      case "/":
        return <Dashboard />;
      case "/partners":
        return <Partners onSelectPartner={handleSelectPartner} />;
      case "/interactions":
        return <Interactions />;
      case "/threads":
        return <Threads />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <InteractionModalProvider>
      <AppLayout currentPath={currentPath} onNavigate={handleNavigate}>
        {renderPage()}
      </AppLayout>
      <LogInteractionModal />
    </InteractionModalProvider>
  );
};

export default Index;
