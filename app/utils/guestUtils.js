// utils/guestUtils.js
export const getGuestId = () => {
  if (typeof window === 'undefined') return null;
  
  let guestId = localStorage.getItem('guest_id');
  
  if (!guestId) {
    // Generate a new guest ID
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('guest_id', guestId);
    
    // Store guest info
    const guestInfo = {
      id: guestId,
      created_at: new Date().toISOString(),
      first_visit: new Date().toISOString(),
      last_activity: new Date().toISOString(),
    };
    localStorage.setItem('guest_info', JSON.stringify(guestInfo));
  }
  
  return guestId;
};

export const getGuestInfo = () => {
  if (typeof window === 'undefined') return null;
  
  const guestInfo = localStorage.getItem('guest_info');
  return guestInfo ? JSON.parse(guestInfo) : null;
};

export const updateGuestInfo = (info) => {
  if (typeof window === 'undefined') return;
  
  const existingInfo = getGuestInfo() || {};
  const updatedInfo = {
    ...existingInfo,
    ...info,
    last_activity: new Date().toISOString(),
  };
  
  localStorage.setItem('guest_info', JSON.stringify(updatedInfo));
};

export const getGuestBookings = () => {
  if (typeof window === 'undefined') return [];
  
  const guestBookings = localStorage.getItem('guest_bookings');
  return guestBookings ? JSON.parse(guestBookings) : [];
};

export const addGuestBooking = (booking) => {
  if (typeof window === 'undefined') return;
  
  const guestBookings = getGuestBookings();
  guestBookings.push(booking);
  localStorage.setItem('guest_bookings', JSON.stringify(guestBookings));
  
  // Update count
  localStorage.setItem('guest_bookings_count', guestBookings.length.toString());
};