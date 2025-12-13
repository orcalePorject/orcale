import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { memberService } from '../../services/memberService';

// Async thunks
export const fetchActiveMembers = createAsyncThunk(
  'members/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await memberService.getActiveMembers();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch members');
    }
  }
);

export const registerMember = createAsyncThunk(
  'members/register',
  async (memberData, { rejectWithValue }) => {
    try {
      const response = await memberService.registerMember(memberData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Registration failed');
    }
  }
);

const initialState = {
  members: [],
  currentMember: null,
  loading: false,
  error: null,
  success: false,
};

const memberSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    clearMemberState: (state) => {
      state.error = null;
      state.success = false;
    },
    setCurrentMember: (state, action) => {
      state.currentMember = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch active members
      .addCase(fetchActiveMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchActiveMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Register member
      .addCase(registerMember.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registerMember.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.members.push(action.payload);
      })
      .addCase(registerMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { clearMemberState, setCurrentMember } = memberSlice.actions;
export default memberSlice.reducer;