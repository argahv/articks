import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useMemo } from "react";
import Router from "next/router";
import useRequest from "../../hooks/useRequest";

const useOptions = () => {
  const options = useMemo(
    () => ({
      fields: {
        billingDetails: {
          name: "never",
          email: "never",
        },
      },
      iconStyle: "solid",
      hidePostalCode: true,
      style: {
        base: {
          color: "#424770",
          letterSpacing: "0.025em",
          fontFamily: "Source Code Pro, monospace",
          "::placeholder": {
            color: "#aab7c4",
          },
        },
        invalid: {
          color: "#9e2146",
        },
      },
    }),
    []
  );

  return options;
};

const CheckoutForm = (orderId) => {
  const elements = useElements();
  const stripe = useStripe();
  const options = useOptions();

  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      ...orderId,
    },
    onSuccess: () => Router.push("/orders"),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }
    const card = elements.getElement(CardElement);

    try {
      const result = await stripe.createToken(card, {
        currency: "npr",
        country: "NP",
      });

      console.log("result", result);

      await doRequest({ token: result.token.id });
    } catch (err) {
      console.log("err", err);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <label>
        Card details
        <CardElement
          options={options}
          onReady={() => {
            console.log("CardElement [ready]");
          }}
          onChange={(event) => {
            console.log("CardElement [change]", event);
          }}
          onBlur={() => {
            console.log("CardElement [blur]");
          }}
          onFocus={() => {
            console.log("CardElement [focus]");
          }}
        />
      </label>
      {errors}
      <button type="submit" disabled={!stripe}>
        Pay
      </button>
    </form>
  );
};

export default CheckoutForm;
