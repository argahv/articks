import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "../../components/payments/CheckoutForm";

const stripeKey = "pk_test_QZWF4IHEsENEVDTOT1CYfXNz00mHL9h9ZM";
// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(stripeKey);

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  function fmtMSS(e) {
    var h = Math.floor(e / 3600)
        .toString()
        .padStart(2, "0"),
      m = Math.floor((e % 3600) / 60)
        .toString()
        .padStart(2, "0"),
      s = Math.floor(e % 60)
        .toString()
        .padStart(2, "0");

    return h + ":" + m + ":" + s;
  }

  return (
    <div>
      <a>Time left to pay: {fmtMSS(timeLeft)} minutes.</a>
      <Elements stripe={stripePromise}>
        <CheckoutForm orderId={order.id} />
      </Elements>
      {/* <StripeCheckout
        token={(token) => console.log(token)}
        // TODO: change to env variable
        stripeKey={"pk_test_QZWF4IHEsENEVDTOT1CYfXNz00mHL9h9ZM"}
        amount={order.ticket.price * 100}
        email={currentUser.email}
      /> */}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
