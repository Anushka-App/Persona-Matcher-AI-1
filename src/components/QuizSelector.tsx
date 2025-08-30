import { QuizPath } from "./StyleAdvisor";

interface QuizSelectorProps {
  onSelectPath: (path: QuizPath) => void;
}

const QuizSelector = ({ onSelectPath }: QuizSelectorProps) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="font-heading text-3xl font-bold text-foreground">
          How would you like to discover your perfect bag?
        </h2>
        <p className="font-body text-lg text-muted-foreground">
          Choose your styling journey
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <button
          onClick={() => onSelectPath("personality")}
          className="group p-8 bg-card border border-border rounded-xl hover:border-primary transition-all duration-300 hover:shadow-lg"
        >
          <div className="text-center space-y-4">
            <div className="text-4xl mb-4">🎭</div>
            <h3 className="font-heading text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              Discover by Personality
            </h3>
            <p className="font-body text-muted-foreground">
              Match your inner vibe and personal style preferences
            </p>
          </div>
        </button>

        <button
          onClick={() => onSelectPath("occasion")}
          className="group p-8 bg-card border border-border rounded-xl hover:border-primary transition-all duration-300 hover:shadow-lg"
        >
          <div className="text-center space-y-4">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="font-heading text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              Choose by Occasion
            </h3>
            <p className="font-body text-muted-foreground">
              Find the perfect bag for your specific needs and events
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default QuizSelector;