<Route
  path="/planned-sessions/:id/edit"
  element={
    <ProtectedRoute>
      <EditPlannedSessionPage />
    </ProtectedRoute>
  }
/>