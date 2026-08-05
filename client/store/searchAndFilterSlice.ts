import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface FilterOptions {
    lineId: number;
    runDayType: number;
}

interface SearchAndFilterState {
  searchQuery: string;
  filterOptions: FilterOptions;
}

const initialState: SearchAndFilterState = {
  searchQuery: "",
  filterOptions: {
    lineId: 0,
    runDayType: 0,
  },
};

const searchAndFilterSlice = createSlice({
  name: "searchAndFilter",
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setFilterOptions(state, action: PayloadAction<FilterOptions>) {
      state.filterOptions = action.payload;
    },
  },
});

export const { setSearchQuery, setFilterOptions } = searchAndFilterSlice.actions;
export default searchAndFilterSlice.reducer;