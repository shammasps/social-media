const sportsSkills = [
    "football-back",
    "football-defence",
    "football-forward",
    "football-gk",
    "football-midfielder",
    "football-striker",
    "football-winger",
    "cricket-batsman",
    "cricket-bowler",
    "cricket-allrounder",
    "basketball-point-guard",
    "basketball-shooting-guard",
    "basketball-small-forward",
    "basketball-power-forward",
    "basketball-center",
    "tennis-singles",
    "tennis-doubles",
    "tennis-baseline",
    "tennis-serve-volley",
    "swimming-freestyle",
    "swimming-backstroke",
    "swimming-breaststroke",
    "swimming-butterfly",
    "swimming-medley",
    "volleyball-setter",
    "volleyball-libero",
    "volleyball-outside-hitter",
    "volleyball-middle-blocker",
    "volleyball-opposite-hitter",
    "baseball-pitcher",
    "baseball-catcher",
    "baseball-first-baseman",
    "baseball-second-baseman",
    "baseball-third-baseman",
    "baseball-shortstop",
    "baseball-outfielder",
    "golf-driver",
    "golf-irons",
    "golf-putter",
    "golf-slice",
    "golf-hook",
    "golf-fade",
    "volleyball-setter",
    "volleyball-libero",
    "volleyball-middle-blocker",
    "volleyball-outside-hitter",
    "volleyball-opposite-hitter",
    "badminton-singles",
    "badminton-doubles",
    "badminton-smash",
    "badminton-drop-shot",
    "badminton-drive",
    "golf-driver",
    "golf-iron",
    "golf-wedge",
    "golf-putter",
    "golf-fairway",
    "table-tennis-forehand",
    "table-tennis-backhand",
    "table-tennis-service",
    "table-tennis-chop",
    "table-tennis-loop",
    "boxing-jab",
    "boxing-cross",
    "boxing-hook",
    "boxing-uppercut",
    "mma-jab",
    "mma-cross",
    "mma-hook",
    "mma-uppercut",
    "mma-kick",
    "hockey-forward",
    "hockey-defense",
    "hockey-goalie",
    "hockey-winger",
    "hockey-center",
    "rugby-prop",
    "rugby-hooker",
    "rugby-lock",
    "rugby-flanker",
    "rugby-number-eight",
    "surfing-regular",
    "surfing-goofy",
    "surfing-drop-knee",
    "surfing-handstand",
    "surfing-tube-riding",
    "skiing-alpine",
    "skiing-cross-country",
    "skiing-freestyle",
    "skiing-jumping",
    "skiing-telemark",
    "snowboarding-freestyle",
    "snowboarding-freeride",
    "snowboarding-alpine",
    "snowboarding-jibbing",
    "snowboarding-powder",
    "climbing-bouldering",
    "climbing-sport",
    "climbing-traditional",
    "climbing-ice",
    "climbing-mountaineering",
    "cycling-road",
    "cycling-mountain",
    "cycling-track",
    "cycling-bmx",
    "cycling-time-trial"
];

const transformedSportsSkills = sportsSkills.map(skill => ({
    value: skill,
    text: skill.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), // Convert dash-separated to title case
    isSelected: false // Initially none selected
}));

module.exports = { sportsSkills: transformedSportsSkills };