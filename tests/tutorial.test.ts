import { describe, it, expect, beforeEach } from "vitest";
import { useGame, STEP_NAV } from "../game/store";
import { TOTAL_TUTORIAL_STEPS, TUTORIAL } from "../game/data/systems";

describe("Tutorial & Instruction Flow", () => {
  beforeEach(() => {
    useGame.getState().reset();
    useGame.getState().startNew("standard");
  });

  it("initializes new game with 12 tutorial steps and active gating", () => {
    const g = useGame.getState();
    expect(g.inTutorial()).toBe(true);
    expect(g.s?.tutorialStep).toBe(1);
    expect(g.s?.tutorialActive).toBe(true);
    expect(g.guidedScreen()).toBe("command");
    expect(TUTORIAL.length).toBe(TOTAL_TUTORIAL_STEPS);
    expect(TOTAL_TUTORIAL_STEPS).toBe(12);
  });

  it("strictly enforces hard navigation gate while in tutorial", () => {
    const g = useGame.getState();
    expect(g.screen).toBe("command");

    // Attempting to jump to unauthorized screens should be blocked
    g.setScreen("market");
    expect(useGame.getState().screen).toBe("command");

    g.setScreen("dev");
    expect(useGame.getState().screen).toBe("command");

    g.setScreen("finance");
    expect(useGame.getState().screen).toBe("command");
  });

  it("maps each tutorial step to its corresponding facility", () => {
    expect(STEP_NAV[1]).toBe("command");
    expect(STEP_NAV[2]).toBe("map");
    expect(STEP_NAV[3]).toBe("expedition");
    expect(STEP_NAV[4]).toBe("expedition");
    expect(STEP_NAV[5]).toBe("lab");
    expect(STEP_NAV[6]).toBe("lab");
    expect(STEP_NAV[7]).toBe("archive");
    expect(STEP_NAV[8]).toBe("finance");
    expect(STEP_NAV[9]).toBe("market");
    expect(STEP_NAV[10]).toBe("dev");
    expect(STEP_NAV[11]).toBe("codex");
    expect(STEP_NAV[12]).toBe("command");
  });

  it("allows navigation when guided step matches target screen", () => {
    useGame.getState().setTutorialStep(2);
    expect(useGame.getState().guidedScreen()).toBe("map");

    useGame.getState().setScreen("map");
    expect(useGame.getState().screen).toBe("map");

    // Other screens remain locked
    useGame.getState().setScreen("finance");
    expect(useGame.getState().screen).toBe("map");
  });

  it("allows player to explicitly skip the tutorial at any time", () => {
    const g = useGame.getState();
    expect(g.inTutorial()).toBe(true);

    g.skipTutorial();
    const updated = useGame.getState();
    expect(updated.inTutorial()).toBe(false);
    expect(updated.s?.tutorialActive).toBe(false);
    expect(updated.s?.tutorialStep).toBe(99);
    expect(updated.s?.tutorialSkipped).toBe(true);

    // All navigation tabs are now freely accessible
    updated.setScreen("market");
    expect(useGame.getState().screen).toBe("market");

    useGame.getState().setScreen("finance");
    expect(useGame.getState().screen).toBe("finance");

    useGame.getState().setScreen("dev");
    expect(useGame.getState().screen).toBe("dev");
  });

  it("completes tutorial and unlocks the institute", () => {
    const g = useGame.getState();
    g.setTutorialStep(12);
    g.completeTutorial();

    const updated = useGame.getState();
    expect(updated.inTutorial()).toBe(false);
    expect(updated.s?.tutorialActive).toBe(false);
    expect(updated.s?.tutorialStep).toBe(99);
    expect(updated.s?.journal.some((j) => j.kind === "tutorial" && j.entry.includes("Dr. Linh"))).toBe(true);
  });
});
