import { createSlice, PayloadAction } from "@reduxjs/toolkit";





export interface CreateDetailedViewState {
    lineId: number | null;
    runDayType: number | null;
    creationName: string;
    detailedPreview : any[] | null;
}
