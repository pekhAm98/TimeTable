import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface FilterOptions {
    lineId: number;
    runDayType: string;
}

interface SearchAndFilterState {
  searchQuery: string;
  filterOptions: FilterOptions;
}

const initialState: SearchAndFilterState = {
  searchQuery: "",
  filterOptions: {
    lineId: 0,
    runDayType: "",
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