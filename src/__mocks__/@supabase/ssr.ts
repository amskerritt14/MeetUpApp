export const createBrowserClient = jest.fn(() => ({
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithPassword: jest.fn().mockResolvedValue({ data: {}, error: null }),
    signInWithOtp: jest.fn().mockResolvedValue({ data: {}, error: null }),
    signUp: jest.fn().mockResolvedValue({ data: {}, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
  },
  from: jest.fn(() => ({
    insert: jest.fn().mockResolvedValue({ data: [], error: null }),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
}))

export const createServerClient = jest.fn(() => ({
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
  },
  from: jest.fn(() => ({
    insert: jest.fn().mockResolvedValue({ data: [], error: null }),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
}))
