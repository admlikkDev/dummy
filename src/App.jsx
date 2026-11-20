import { useRoutes } from "react-router-dom";
import WelcomeScreen from "./views/photobooth/WelcomeScreen";
import CategorySelection from "./views/CategorySelection";
import PaymentMethod from "./views/PaymentMethod";
import PackageSelection from "./views/PackageSelection";
import Login from "./views/Login";
import Scanner from "./views/photobooth/ScannerScreen";
import BookingPage from "./views/BookingPage";
import TransaksiTerkini from "./views/owner/TransaksiTerkini";
import RiwayatTransaksi from "./views/owner/RiwayatTransaksi";
import StatusMesin from "./views/owner/StatusMesin";
import Tutorial from "./views/Tutorial";
import PermissionScreen from "./views/photobooth/PermissionScreen";
import FrameSelectionScreen from "./views/photobooth/FrameSelectionScreen";
import PhotoSession from "./views/photobooth/PhotoSession";
import PhotoSelectionPage from "./views/photobooth/PhotoSelectionPage";
import SelectFilter from "./views/photobooth/SelectFilter";
import PhotoResultPage from "./views/photobooth/PhotoResultPage";
import Finish from "./views/photobooth/Finish";
import PencatatanKeuangan from "./views/owner/PencatatanKeuangan";
import Gallery from "./views/owner/Gallery";
// import PhotoSelectionPage from "./views/photobooth/PhotoSelectionPage";

export default function App() {
  return useRoutes([
    {
      path: '/',
      element: <></>
    },
    {
      path: '/booking',
      element: <BookingPage/>
    },
    {
      path: '/login',
      element: <Login/>
    },
    {
      path: '/:name/tutorial',
      element: <Tutorial/>
    },
    {
      path: '/:name/permission',
      element: <PermissionScreen/>
    },
    {
      path: '/:name/scanner',
      element: <Scanner/>
    },
    {
      path: '/:name/select-frame/:code',
      element: <FrameSelectionScreen/>
    },
    {
      path: '/:name/start-photo/:code',
      element: <PhotoSession/>
    },
    {
      path: '/:name/select-photos/:code',
      element: <PhotoSelectionPage/>
    },
    {
      path: '/:name/select-filter/:code',
      element: <SelectFilter/>
    },
    {
      path: '/:name/result/:code',
      element: <PhotoResultPage/>
    },
    {
      path: '/nusnaps/result/:code',
      element: <Finish/>
    },
    {
      path: '/category-selection',
      element: <CategorySelection/>
    },
    {
      path: '/:category/:id/payment',
      element: <PaymentMethod/>
    },
    {
      path: '/:category/:id/package',
      element: <PackageSelection/>
    },
    {
      path: '/:name/welcome',
      element: <WelcomeScreen/>
    },

    //owner
    {
      path: '/owner/transaksi-terkini',
      element: <TransaksiTerkini/>
    },
    {
      path: '/owner/riwayat-transaksi',
      element: <RiwayatTransaksi/>
    },
    {
      path: '/owner/status-mesin-photobooth',
      element: <StatusMesin/>
    },
    {
      path: '/owner/catatan-keuangan',
      element: <PencatatanKeuangan/>
    },
    {
      path: '/owner/galeri-photobooth',
      element: <Gallery/>
    },
    //kasir
    {
      path: '/kasir/transaksi-terkini',
      element: <TransaksiTerkini/>
    },
    {
      path: '/kasir/riwayat-transaksi',
      element: <RiwayatTransaksi/>
    },
    {
      path: '/kasir/status-mesin-photobooth',
      element: <StatusMesin/>
    },
    {
      path: '/kasir/pencatatan-keuangan',
      element: <PencatatanKeuangan/>
    },
    {
      path: '/kasir/galeri-photobooth',
      element: <Gallery/>
    },
  ])
}