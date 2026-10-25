import Swal from "sweetalert2";

// Base custom SweetAlert2 instance matching Tandoori Koti dark/gold theme
const customSwal = Swal.mixin({
  customClass: {
    popup:
      "bg-slate-900 border border-amber-500/30 text-slate-100 rounded-3xl shadow-2xl font-sans",
    title: "text-amber-400 font-serif font-bold text-lg",
    htmlContainer: "text-slate-300 text-sm",
    confirmButton:
      "bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider mx-1 cursor-pointer transition-all border-0 focus:outline-none",
    cancelButton:
      "bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider mx-1 cursor-pointer transition-all border border-slate-700 focus:outline-none",
  },
  buttonsStyling: false,
});

export const alert = {
  // 1. Success Message
  success: (title, text = "") => {
    return customSwal.fire({
      icon: "success",
      title,
      text,
      timer: 2200,
      showConfirmButton: false,
    });
  },

  // 2. Error Message
  error: (title, text = "") => {
    return customSwal.fire({
      icon: "error",
      title,
      text,
    });
  },

  // 3. Confirmation Dialog (Returns promise with { isConfirmed })
  confirm: async ({
    title = "Are you sure?",
    text = "This action cannot be undone.",
    confirmText = "Yes, Proceed",
    cancelText = "Cancel",
  }) => {
    return customSwal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
    });
  },

  // 4. Loading State
  loading: (title = "Loading...", text = "Please wait...") => {
    customSwal.fire({
      title,
      text,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
  },

  // 5. Toast Notification (Top Right)
  toast: (title, icon = "info") => {
    return customSwal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  },

  // 6. Image Preview Modal
  previewImage: (imageUrl, title = "Image Preview") => {
    return customSwal.fire({
      title,
      imageUrl,
      imageAlt: title,
      showConfirmButton: false,
      showCloseButton: true,
      customClass: {
        popup: "bg-slate-900 border border-amber-500/30 rounded-3xl p-4",
        image: "rounded-2xl max-h-[70vh] object-cover",
      },
    });
  },

  // 7. Close Active Alert
  close: () => {
    Swal.close();
  },
};
