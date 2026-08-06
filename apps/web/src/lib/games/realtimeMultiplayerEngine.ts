import { createClient } from '@/utils/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type MultiplayerPlayer = {
  id: string;
  name: string;
  isHost: boolean;
  score: number;
  ready: boolean;
};

export type GameRoomState = {
  roomCode: string;
  gameId: string;
  status: 'waiting' | 'playing' | 'ended';
  players: MultiplayerPlayer[];
  currentTurnPlayerId: string | null;
  gameState: Record<string, unknown>;
};

export class RealtimeMultiplayerRoom {
  private channel: RealtimeChannel | null = null;
  private supabase = createClient();
  public roomCode: string;
  public gameId: string;
  public localPlayer: MultiplayerPlayer;
  public state: GameRoomState;
  private onStateUpdate?: (state: GameRoomState) => void;

  constructor(gameId: string, playerName: string, roomCode?: string) {
    this.gameId = gameId;
    this.roomCode = roomCode || Math.floor(100000 + Math.random() * 900000).toString();
    const playerId = `player_${Math.random().toString(36).substring(2, 9)}`;

    this.localPlayer = {
      id: playerId,
      name: playerName || 'Player 1',
      isHost: !roomCode,
      score: 0,
      ready: true,
    };

    this.state = {
      roomCode: this.roomCode,
      gameId,
      status: 'waiting',
      players: [this.localPlayer],
      currentTurnPlayerId: this.localPlayer.id,
      gameState: {},
    };
  }

  public subscribe(onStateUpdate: (state: GameRoomState) => void) {
    this.onStateUpdate = onStateUpdate;
    const channelName = `game_room_${this.gameId}_${this.roomCode}`;

    this.channel = this.supabase.channel(channelName, {
      config: {
        broadcast: { self: true },
        presence: { key: this.localPlayer.id },
      },
    });

    this.channel
      .on('broadcast', { event: 'room_state_update' }, ({ payload }) => {
        if (payload && typeof payload === 'object') {
          this.state = payload as GameRoomState;
          if (this.onStateUpdate) this.onStateUpdate(this.state);
        }
      })
      .on('broadcast', { event: 'player_action' }, ({ payload }) => {
        if (payload && typeof payload === 'object' && this.onStateUpdate) {
          const action = payload as { type: string; data: Record<string, unknown>; playerId: string };
          this.handlePlayerAction(action);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.broadcastState();
        }
      });
  }

  public broadcastState() {
    if (!this.channel) return;
    void this.channel.send({
      type: 'broadcast',
      event: 'room_state_update',
      payload: this.state,
    });
  }

  public sendAction(actionType: string, actionData: Record<string, unknown>) {
    if (!this.channel) return;
    void this.channel.send({
      type: 'broadcast',
      event: 'player_action',
      payload: {
        type: actionType,
        data: actionData,
        playerId: this.localPlayer.id,
      },
    });
  }

  private handlePlayerAction(action: { type: string; data: Record<string, unknown>; playerId: string }) {
    if (action.type === 'JOIN_ROOM') {
      const existing = this.state.players.find((p) => p.id === action.playerId);
      if (!existing) {
        const newPlayer: MultiplayerPlayer = {
          id: action.playerId,
          name: (action.data.name as string) || 'Player 2',
          isHost: false,
          score: 0,
          ready: true,
        };
        this.state.players.push(newPlayer);
        if (this.state.players.length >= 2 && this.state.status === 'waiting') {
          this.state.status = 'playing';
        }
        this.broadcastState();
      }
    } else if (action.type === 'MOVE') {
      this.state.gameState = {
        ...this.state.gameState,
        ...action.data,
      };
      if (this.onStateUpdate) this.onStateUpdate(this.state);
    }
  }

  public leave() {
    if (this.channel) {
      void this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}
