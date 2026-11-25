import { criteria, calculateRocWeights, urgencyOptions } from "@/src/lib/criteria";
import { requireSession } from "@/lib/session";
import { AppLayout } from "@/app/components/AppLayout";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { Table } from "@/app/components/ui/Table";
import { Tex } from "@/src/components/Tex";

const ratingScales: Record<string, string> = {
  C1: "Skor 1: ≤ Rp 2.500.000\nSkor 2: > Rp 2.500.000 s.d. ≤ Rp 3.000.000\nSkor 3: > Rp 3.000.000 s.d. ≤ Rp 3.500.000\nSkor 4: > Rp 3.500.000 s.d. ≤ Rp 4.000.000\nSkor 5: > Rp 4.000.000",
  C2: "Skor 1: ≤ Rp 600.000\nSkor 2: > Rp 600.000 s.d. ≤ Rp 1.200.000\nSkor 3: > Rp 1.200.000 s.d. ≤ Rp 1.800.000\nSkor 4: > Rp 1.800.000 s.d. ≤ Rp 2.400.000\nSkor 5: > Rp 2.400.000 s.d. Rp 3.000.000",
  C3: urgencyOptions.map((o) => `Skor ${o.value}: ${o.description}`).join("\n"),
  C4: "Skor 1: 0 orang\nSkor 2: 1 orang\nSkor 3: 2 orang\nSkor 4: 3 orang\nSkor 5: > 3 orang",
  C5: "Skor 1: ≤ 30 tahun\nSkor 2: 31 - 40 tahun\nSkor 3: 41 - 50 tahun\nSkor 4: 51 - 60 tahun\nSkor 5: > 60 tahun",
};

async function CriteriaContent() {
  const sessionUsername = await requireSession();
  const weights = calculateRocWeights(criteria.length);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  return (
    <AppLayout sessionUsername={sessionUsername}>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-2xl p-6 border border-[#e6e2dc] shadow-2xs">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-[#1f1e1c]">Kriteria & Bobot ROC</h2>
            <p className="text-[#5e5b56] text-sm max-w-2xl leading-relaxed">
              Konfigurasi parameter penilaian calon penerima pinjaman Koperasi Panji Borneo Mandiri dengan pembobotan Rank Order Centroid (ROC) secara otomatis.
            </p>
          </div>
          <Badge variant="rekomendasi">Hanya-Baca (Read-Only)</Badge>
        </div>

        {/* Criteria Table Card */}
        <Card title="Daftar Kriteria Penilaian" description="Parameter C1 sampai C5 beserta bobot dan skala penilaian">
          <div className="space-y-6 pt-2">
            <Table headers={["Kode", "Nama Kriteria", "Jenis", "Prioritas", <span key="w_j">Bobot (<Tex>{"W_j"}</Tex>)</span>, "Skala Penilaian"]}>
              {criteria.map((criterion, idx) => {
                const weight = weights[idx];
                return (
                  <tr key={criterion.code}>
                    <td className="px-4 py-4 whitespace-nowrap font-mono font-bold text-[#1f1e1c]">{criterion.code}</td>
                    <td className="px-4 py-4 font-semibold text-[#1f1e1c]">{criterion.name}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge variant={criterion.type === "benefit" ? "benefit" : "cost"}>
                        {criterion.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center font-medium text-[#5e5b56]">{criterion.priority}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-right font-mono font-semibold text-[#1f1e1c]">
                      {weight.toFixed(4)}
                    </td>
                    <td className="px-4 py-4 whitespace-pre-line text-xs text-[#5e5b56] leading-relaxed">
                      {ratingScales[criterion.code] || "-"}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-[#f7f5f0] font-bold">
                <td colSpan={4} className="px-4 py-3.5 text-right text-sm text-[#1f1e1c]">Total Bobot:</td>
                <td className="px-4 py-3.5 text-right font-mono text-sm text-[#1b4d3e]">{totalWeight.toFixed(4)}</td>
                <td></td>
              </tr>
            </Table>

            <details className="p-4 bg-[#1b4d3e]/5 border border-[#1b4d3e]/20 rounded-xl text-xs text-[#1f1e1c]">
              <summary className="font-bold uppercase tracking-wider text-[#1b4d3e] cursor-pointer select-none">
                Metodologi Pembobotan ROC (Rank Order Centroid)
              </summary>
              <div className="space-y-3 leading-relaxed pt-3">
                <p>
                  Bobot ROC dihitung berdasarkan tingkat kepentingan (prioritas) kriteria tanpa subjektivitas manual. Rumus yang digunakan adalah:
                </p>
                <div className="py-1">
                  <Tex display>{`W_j = \\frac{1}{M} \\sum_{i=j}^{M} \\frac{1}{i}`}</Tex>
                </div>
                <p>
                  Di mana <Tex>{"M"}</Tex> adalah jumlah total kriteria dan <Tex>{"j"}</Tex> adalah nomor urut prioritas.
                </p>
              </div>
            </details>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

export default function CriteriaPage() {
  return <CriteriaContent />;
}
