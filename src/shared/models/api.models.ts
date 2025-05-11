export interface EventBreakdown { meetings: number; emails: number; calls: number; follows: number; }
export interface ProjectionDay { day: 1 | 2 | 3 | 4 | 5; events: EventBreakdown; }
export type CyclePriority = 'HIGH' | 'MEDIUM' | 'LOW';
export interface Cycle { name: string; availableEntities: number; priority: CyclePriority; structure: Array<EventBreakdown & { day: 1|2|3|4|5 }>; }
export interface ApiResponse { eventsProjection: ProjectionDay[]; cycles: Cycle[]; }
