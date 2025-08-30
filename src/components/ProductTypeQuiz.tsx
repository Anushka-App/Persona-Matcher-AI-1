import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";

const bagTypes = [
    "Crossbody",
    "Tote",
    "Clutch",
    "Backpack",
    "Hobo",
    "No Preference",
];

const ProductTypeQuiz = () => {
    const navigate = useNavigate();
    const locationState = useLocation().state as { persona: string };
    const persona = locationState?.persona || "";

    const [selected, setSelected] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const description = `${persona} who prefers ${selected}`;
            const response = await fetch("/recommendations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description }),
            });
            const data = await response.json();
            navigate("/results/text", {
                state: { products: data.recommendations || [], explanation: data.explanation || '' }
            });
        } catch (err) {
            console.error(err);
            navigate("/results/text", { state: { products: [], explanation: '' } });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pt-20">
            <div className="container mx-auto px-4">
                <h1 className="font-heading text-3xl font-bold mb-6 text-palo-primary">
                    Choose Your Preferred Bag Style
                </h1>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {bagTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelected(type)}
                            className={`p-4 border rounded-lg transition-colors $
                selected === type
                  ? 'border-palo-primary bg-palo-primary/10'
                  : 'border-border hover:border-palo-accent'
              }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
                <Button
                    onClick={handleSubmit}
                    disabled={!selected || isLoading}
                    className="px-8 py-4"
                >
                    {isLoading ? 'Loading...' : 'Get Recommendations'}
                </Button>
            </div>
        </div>
    );
};

export default ProductTypeQuiz;
