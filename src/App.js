import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import LandingPage from './Assests/Components/Home/LandingPage';
import Dashboard from './Assests/Components/Home/Dashboard';
import PrivateComponents from './Assests/Components/PrivateComponents/PrivateComponents';
import Contacts from './Assests/Components/Features/Contacts';
import Imports from './Assests/Components/Features/Imports';
import Billing from './Assests/Components/Features/Billing';
import Reports from './Assests/Components/Features/Reports';
import ProtectedPayment from './Assests/Components/PrivateComponents/ProtectedPayments';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import Invoices from './Assests/Components/Features/Invoices';
import Subscriptions from './Assests/Components/Features/Subscriptions';

function App() {
  return (
    <div className="App">
      <PayPalScriptProvider options={{
        "client-id": "Ab_X1nxtPH3i9oD2kPlMFJmoYGiN6i0oFv98hoDZAve0NjC2wTHRU-hbvRiALVxoKzNGfZbx-8DoPlAr",
        currency: "USD",
        intent: "capture",
        components: "buttons",
      }}>
        <BrowserRouter>
          <Routes>
            <Route path='/' Component={LandingPage} />
            <Route element={<PrivateComponents />}>
              <Route path='/Dashboard' Component={Dashboard} />
              <Route path='/Contacts' Component={Contacts} />
              <Route path='/Imports' Component={Imports} />
              <Route path='/Reports' Component={Reports} />
              <Route path='/Billing' Component={Billing} />
              <Route path='/Payment' Component={ProtectedPayment} />
              <Route path='/invoices' Component={Invoices} />
              <Route path='/subscriptions' Component={Subscriptions} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PayPalScriptProvider>
    </div >
  );
}

export default App;
