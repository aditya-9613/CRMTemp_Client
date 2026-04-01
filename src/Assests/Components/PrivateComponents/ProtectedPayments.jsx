import { useLocation, Navigate } from 'react-router-dom'
import Payments from '../Features/Payments/Payments'


const ProtectedPayment = () => {
    const { state } = useLocation()

    // If no billing state exists — hard redirect to billing, no way to access directly
    if (!state || !state.totalAmount) {
        return <Navigate to="/billing" replace />
    }

    return <Payments />
}

export default ProtectedPayment