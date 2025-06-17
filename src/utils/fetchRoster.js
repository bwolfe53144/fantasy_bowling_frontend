import { checkHasRegular, getRoster, getRosterLockStatus, generateRoster } from "./api";
import { resolveDuplicatePositions } from "./resolveDuplicatePositions";
import { calculateFantasyPoints } from "./FantasyPoints";

export const fetchRoster = async ({
  user,
  currentWeek,
  navigate,
  setPlayers,
  setAssignedPositions,
  setLockedPlayerIds,
  setLockedPositions,
  setPlayersLoaded,
  setCheckingRegularRoster,
  generateRosterForWeek,
}) => {
  if (!user?.team?.id) {
    setCheckingRegularRoster(false);
    return;
  }

  try {
    const { hasRegular } = (await checkHasRegular(user.team.id)).data;

    if (!hasRegular) {
        const currentDate = new Date();
        const weekLockResponse = await getRosterLockStatus(user.team.id, currentWeek);
        const weekLock = weekLockResponse.data;
      
        if (currentDate > new Date(weekLock.lockTime)) {
          // Generate weekly roster, don't redirect
          await generateRoster(user.team.id, currentWeek);
        } else {
          // Too early to auto-generate, redirect to regular roster
          navigate("/regular-roster");
          return;
        }
      }

    setCheckingRegularRoster(false);

    let response = await getRoster(user.team.id, currentWeek);
    let roster = response.data;

    if (!roster || roster.length === 0) {
      if (generateRosterForWeek) {
        await generateRosterForWeek(user.team.id, currentWeek);
        response = await getRoster(user.team.id, currentWeek); // retry after generation
        roster = response.data;
      }

      if (!roster || roster.length === 0) {
        console.warn("Roster is still empty after generation.");
        setPlayers([]);
        setAssignedPositions({});
        setPlayersLoaded(true);
        return;
      }
    }

    const lockStatusResponse = await getRosterLockStatus(user.team.id, currentWeek);
    const lockedIds = lockStatusResponse.data.lockedPlayerIds || [];
    setLockedPlayerIds(lockedIds);

    const lockedPositionsThisWeek = roster
      .filter(entry => lockedIds.includes(entry.player.id) && entry.position)
      .map(entry => entry.position);
    setLockedPositions(lockedPositionsThisWeek);

    const flexPositions = Array.from({ length: 9 }, (_, i) => `Flex Bench ${i + 1}`);
    const formattedPlayers = roster.map(entry => {
      const player = entry.player;
      return {
        ...player,
        setPosition: entry.position || "",
        allowedPositions: [player.position, "Flex", ...flexPositions],
        isLocked: lockedIds.includes(player.id),
      };
    });

    const resolvedAssignments = resolveDuplicatePositions(formattedPlayers, lockedIds);
    const updatedPlayers = formattedPlayers.map(p => ({
      ...p,
      setPosition: resolvedAssignments[p.id] || "",
    }));

    const sorted = updatedPlayers.sort((a, b) => {
      const posCompare = a.setPosition?.localeCompare(b.setPosition || "") || 0;
      return posCompare === 0 ? a.name.localeCompare(b.name) : posCompare;
    });

    const fixLockedPositionConflicts = (players) => {
      const takenPositions = new Set();
      const positionMap = {};
      const conflicts = [];

      const lockedPlayers = players.filter(p => p.isLocked && p.setPosition);
      lockedPlayers.forEach(player => {
        const pos = player.setPosition;
        if (!takenPositions.has(pos)) {
          takenPositions.add(pos);
          positionMap[pos] = player.id;
        } else {
          conflicts.push(player);
        }
      });

      const updatedPlayers = players.map(player => {
        const weekScore = player.weekScores?.find(ws => ws.week === currentWeek);
        const fantasyPoints = weekScore ? calculateFantasyPoints([weekScore]) : 0;

        if (!player.isLocked || !player.setPosition) {
          return { ...player, fantasyPoints };
        }

        if (positionMap[player.setPosition] === player.id) {
          return { ...player, fantasyPoints };
        }

        const validPositions = [
          ...player.allowedPositions,
          "Flex",
          ...flexPositions,
        ].filter(pos =>
          (!takenPositions.has(pos) && player.allowedPositions.includes(pos)) || pos.startsWith("Flex")
        );

        const newPos = validPositions[0];

        if (newPos) {
          takenPositions.add(newPos);
          positionMap[newPos] = player.id;
          return { ...player, setPosition: newPos, fantasyPoints };
        }

        console.warn(`No valid position found for locked player ${player.name}`);
        return { ...player, fantasyPoints };
      });

      const updatedAssigned = updatedPlayers.reduce((acc, p) => {
        if (p.setPosition) acc[p.id] = p.setPosition;
        return acc;
      }, {});

      setPlayers(updatedPlayers);
      setAssignedPositions(updatedAssigned);
    };

    fixLockedPositionConflicts(sorted);
    setPlayersLoaded(true);

  } catch (error) {
    console.error("Failed to fetch roster:", error);
    setCheckingRegularRoster(false);
  }
};