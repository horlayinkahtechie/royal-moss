import React from "react";
import AddRoomPage from "../../_components/admin/AddNewRoom";

export const metadata = {
  title: "Add New Room | Admin – Royal Moss Hotel",
  description:
    "Admin panel for adding new rooms to Royal Moss Hotel. Restricted access.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function Page() {
  return (
    <div>
      <AddRoomPage />
    </div>
  );
}
