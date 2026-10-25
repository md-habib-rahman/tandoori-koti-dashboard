import HeroManager from "../../../components/hero/HeroManager";

export const metadata = { title: "Hero | Dashboard" };

export default function HeroDashboardPage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-1 text-2xl font-semibold text-gray-900">
        Homepage hero
      </h1>
      <p className="mb-8 text-sm text-gray-600">
        Edit the three slides and the bottom band shown at the top of the
        homepage.
      </p>
      <HeroManager />
    </main>
  );
}
