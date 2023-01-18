import initStripe from "stripe";
// import { useUser } from "../context/user";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Box, HStack, Stack } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";

const Pricing = ({ plans }) => {
  // const { user, login, isLoading } = useUser();

  const processSubscription = (planId) => async () => {
    const { data } = await axios.get(`/api/subscription/${planId}`);
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
    await stripe.redirectToCheckout({ sessionId: data.id });
  };

  const showSubscribeButton = true; //!!user && !user.is_subscribed;
  const showCreateAccountButton = true; //!user;
  const showManageSubscriptionButton = true; //!!user && user.is_subscribed;

  return (
    <Stack spacing={"16px"}>
      {console.log("plans", plans)}
      {plans.map((plan) => (
        <Box key={plan.id} border={"1px solid red"} p={"10px"}>
          <h2 className="text-xl">{plan.name}</h2>
          <p className="text-gray-500">
            ${plan.price / 100} / {plan.interval}
          </p>
          {true && (
            <HStack spacing={"16px"}>
              {showSubscribeButton && (
                <Button
                  onClick={processSubscription(plan.id)}
                  border={"1px solid green"}
                  p={"8px"}
                >
                  Subscribe
                </Button>
              )}
              {/* {showCreateAccountButton && (
                <button onClick={login}>Create Account</button>
              )} */}
              {/* {showManageSubscriptionButton && (
                <Button border={"1px solid green"} p={"8px"}>
                  Manage Subscription
                </Button>
              )} */}
            </HStack>
          )}
        </Box>
      ))}
    </Stack>
  );
};

export const getStaticProps = async () => {
  const stripe = initStripe(process.env.STRIPE_SECRET_KEY);

  const { data: prices } = await stripe.prices.list();

  const plans = await Promise.all(
    prices.map(async (price) => {
      const product = await stripe.products.retrieve(price.product);
      return {
        id: price.id,
        name: product.name,
        price: price.unit_amount,
        // interval: price.recurring.interval,
        currency: price.currency,
      };
    })
  );

  const sortedPlans = plans.sort((a, b) => a.price - b.price);

  return {
    props: {
      plans: sortedPlans,
    },
  };
};

export default Pricing;
