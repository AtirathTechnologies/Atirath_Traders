// import React from 'react';
// import { useNavigate } from 'react-router-dom';

// const ProfilePage = ({ currentUser, onNavigate }) => {
//   const navigate = useNavigate();

//   const handleClose = () => {
//     navigate(-1); // Go back to previous page
//   };

//   const handleSignOut = () => {
//     if (window.confirm('Are you sure you want to sign out?')) {
//       onNavigate('signout');
//     }
//   };

//   if (!currentUser) {
//     return (
//       <div className="profile-page">
//         <div className="container">
//           <div className="profile-container">
//             <div className="profile-header">
//               <h1>My Account</h1>
//               <button className="close-btn" onClick={handleClose}>×</button>
//             </div>
//             <div className="profile-content">
//               <p>Please sign in to view your profile.</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Format member since date
//   const memberSince = new Date(currentUser.createdAt).toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric'
//   });

//   // Get initials for avatar
//   const getInitials = (name) => {
//     return name.split(' ').map(n => n[0]).join('').toUpperCase();
//   };

//   return (
//     <div className="profile-page">
//       <div className="container">
//         <div className="profile-container">
//           <div className="profile-header">
//             <h1>My Account</h1>
//             <button className="close-btn" onClick={handleClose}>×</button>
//           </div>

//           <div className="account-sections">
//             {/* Avatar and Basic Info */}
//             <div className="account-avatar-section">
//               <div className="avatar-circle">
//                 <span className="avatar-initials">{getInitials(currentUser.name)}</span>
//               </div>
//               <div className="avatar-info">
//                 <div className="username">{currentUser.name}</div>
//                 <div className="user-email">{currentUser.email}</div>
//               </div>
//             </div>

//             {/* Account Information */}
//             <div className="account-section">
//               <div className="section-header">
//                 <h3>Account Information</h3>
//               </div>
//               <div className="form-grid">
//                 <div className="form-group">
//                   <label>Full Name:</label>
//                   <div className="form-value">{currentUser.name}</div>
//                 </div>
//                 <div className="form-group">
//                   <label>Email:</label>
//                   <div className="form-value">{currentUser.email}</div>
//                 </div>
//                 <div className="form-group">
//                   <label>Member Since:</label>
//                   <div className="form-value">{memberSince}</div>
//                 </div>
//               </div>
//             </div>

//             {/* Account Status */}
//             <div className="account-section">
//               <div className="section-header">
//                 <h3>Account Status</h3>
//               </div>
//               <div className="form-grid">
//                 <div className="form-group">
//                   <label>Status:</label>
//                   <div className="form-value status-verified">
//                     <span className="status-badge">Verified</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="action-buttons">
//               <button className="btn btn-secondary" onClick={handleClose}>
//                 Close
//               </button>
//               <button className="btn btn-primary" onClick={handleSignOut}>
//                 Sign Out
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;