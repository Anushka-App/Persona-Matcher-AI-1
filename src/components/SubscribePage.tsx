import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SubscribePage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const tier = searchParams.get("tier");

    return (
        <div className="min-h-screen bg-palo-background pt-20">
            <section className="py-24 text-center">
                <h1 className="font-heading text-6xl font-bold text-palo-primary mb-8">
                    Thank You for Subscribing!
                </h1>
                <p className="font-body text-xl text-muted-foreground max-w-3xl mx-auto px-4 mb-12">
                    You have successfully subscribed to the Anuschka Circle with the{" "}
                    <span className="font-bold text-palo-accent">
                        {tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : "Default"}
                    </span>{" "}
                    tier. Welcome to our community of art lovers!
                </p>

                <div className="max-w-md mx-auto px-4">
                    <p className="text-muted-foreground mb-8">
                        You'll receive a confirmation email shortly with more details about your benefits.
                    </p>
                    <Button
                        onClick={() => navigate("/")}
                        size="lg"
                        className="bg-palo-primary hover:bg-palo-accent text-white px-12 py-4 text-lg font-body rounded-full transition-all duration-300"
                    >
                        Back to Home
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default SubscribePage;