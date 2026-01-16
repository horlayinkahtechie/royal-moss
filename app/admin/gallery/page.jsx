import Gallery from "./gallery";

export const metadata = {
  title: "Admin Gallery – Hotel Management",
  description:
    "Admin gallery management page for uploading and managing hotel images.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function Page() {
  return (
    <div>
      <Gallery />
    </div>
  );
}
