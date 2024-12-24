import EditUrlModal from "@/components/home/EditUrlModal";
import UrlItem from "@/components/home/UrlItem";
import { useAppContext } from "@/contexts/AppProvider";
import { Url } from "@/types";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { ArrowsRightLeftIcon, DocumentCheckIcon, ListBulletIcon, UserIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

type SidebarProps = {
  urls: Url[];
  fetchUrls: () => void;
};

export default function Sidebar({ urls, fetchUrls }: SidebarProps) {
  const { showMobileSidebar, setShowMobileSidebar, isMobile } = useAppContext();
  const [toEdit, setToEdit] = useState<Url | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  return (
    <>
      <EditUrlModal
        show={showEditModal}
        hide={() => {
          setShowEditModal(false);
          setToEdit(null);
        }}
        fetchUrls={fetchUrls}
        toEdit={toEdit}
      />
      {/*  ---------------------------- Desktop Sidebar ---------------------------- */}
      {/*  ---------------------------- Desktop Sidebar ---------------------------- */}
      <div className="sticky top-[55px] self-start shrink-0 overflow-hidden">
        <div
          className={` h-[calc(100vh-55px)] w-[350px] bg-white hidden md:block overflow-hidden border border-slate-200 duration-200 ${
            urls?.length ? "" : "mr-[-350px]"
          }`}
        >
          <div className="h-full flex flex-col px-3 py-6">
            <h3 className="text-2xl text-center font-bold">Your URLs</h3>
            <div className="grow overflow-y-auto">
              {urls?.length ? (
                <ul className=" flex flex-col gap-2 mt-4 text-sm">
                  {urls.map((url) => (
                    <UrlItem key={url._id} url={url} setToEdit={setToEdit} setShowEditModal={setShowEditModal} />
                  ))}
                </ul>
              ) : (
                <p className="mt-6 text-center font-semibold text-xl text-slate-700">You have no shortened URLs</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/*  ---------------------------- Mobile Sidebar ---------------------------- */}
      {/*  ---------------------------- Mobile Sidebar ---------------------------- */}
      <Dialog
        open={isMobile && showMobileSidebar}
        onClose={() => {
          setShowMobileSidebar(false);
        }}
        className="relative z-50"
      >
        {isMobile && <DialogBackdrop transition className="fixed inset-0 bg-black/30 cursor-pointer duration-200 data-[closed]:opacity-0" />}

        {/* Full-screen container to center the panel */}
        {/* The actual dialog panel  */}
        <DialogPanel
          transition
          className={`fixed md:top-[70px] top-0 right-0 bottom-0 w-full max-w-[280px] bg-white overflow-hidden shadow-[1px_1px_40px_rgb(0,0,0,.2)] duration-200 data-[closed]:translate-x-full`}
        >
          {/*  ---------------------------- Start Sidebar Content ---------------------------- */}
          {/*  ---------------------------- Start Sidebar Content ---------------------------- */}
          {/*  ---------------------------- Start Sidebar Content ---------------------------- */}
          {/*  ---------------------------- Start Sidebar Content ---------------------------- */}
        </DialogPanel>
      </Dialog>
    </>
  );
}

const items1 = [
  // {
  //   name: "Dashboard",
  //   Icon: <HomeIcon className="size-5" />,
  //   path: "/app",
  //   strict: true,
  // },
  {
    name: "Debt Manager",
    Icon: <DocumentCheckIcon className="size-5" />,
    path: "/app/debt-manager",
  },
  {
    name: "Transactions",
    Icon: <ArrowsRightLeftIcon className="size-5" />,
    path: "/app/transactions",
  },
  {
    name: "Contacts",
    Icon: <ListBulletIcon className="size-5" />,
    path: "/app/contacts",
  },
  {
    name: "Profile",
    // Icon: <Doctor02Icon className="size-5" />,
    Icon: <UserIcon className="size-5" />,
    path: "/app/profile",
  },
];
