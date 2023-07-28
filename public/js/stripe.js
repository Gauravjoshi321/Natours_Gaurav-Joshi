import axios from "axios";
import { showAlert } from "./alerts";

const bookTourButton = document.getElementById('book-tour');

const stripe = Stripe('pk_test_51NWCeCSDFqjU2wBWpRcRyjKPo8Rg1WxOgRWey7ptY4c0Le39eM1P7c4KEIBULvKMOaeOP4CpjFOGI7SmAITfnGCJ001Y0iphhn')

export const bookTour = async tourId => {
  try {
    // 1. Get checkout session from the API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2. Create checkout form + Charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    })

    showAlert('success', 'hjk');

  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
}