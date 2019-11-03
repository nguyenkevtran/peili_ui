import React from 'react';
import './profile-header.styles.scss';

import settingImg from '../../assets/images/settings.png';

import { Link } from 'react-router-dom';

const ProfileHeader = () => {
  return (
    <div className="profile-header">
      <Link to="/profile/settings">
        <img src={settingImg} alt="settings" className="settings-icon" />
      </Link>

      <div className="profile-img-container">
        <img src="https://randomuser.me/api/portraits/med/men/75.jpg" alt="avatar" />
      </div>
      <div className="profile-info">
        <h2 className="name">michael jackson</h2>
        <p className="email">michael@gmail.com</p>
        <span className="exp">
          <span>1000 EXP</span>
        </span>
        {/* <Link to="/profile">
          get rewards <FaArrowRight />
        </Link> */}
      </div>
    </div>
  );
};

export default ProfileHeader;
