import axios from "axios"
import { baseURL } from "./baseURL"

const checkSubscription = async () => {
  return axios({
    url: `${baseURL}/api/v1/payment/getSubscription`,
    method: 'GET',
    withCredentials: true,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('user')}`
    }
  }).then((res) => {
    return res.data.data.data
  }).catch((err) => {
    return null
  })
}

export default checkSubscription