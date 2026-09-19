import EcoLedger from "../components/ledger/EcoLedger";
import DropoffFinder from "../components/map/DropoffFinder";

export default function MapPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <DropoffFinder />
      <EcoLedger />
    </div>
  );
}
