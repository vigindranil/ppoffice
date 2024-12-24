import React, { useState, useEffect } from 'react';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    // Simulated API call to fetch user data
    const fetchProfileData = async () => {
      const response = {
        status: 0,
        message: 'Data found',
        data: [
          {
            ps_id: 54,
            ps_name: 'sunil-125',
            ps_username: 'Sunil Chetril',
            ps_email: 'vyoma.doe@example.com',
            ps_contactnumber: 9433364965,
            WBP_ID: 'WB/RQ/RS/978',
          },
        ],
      };
      setProfileData(response.data[0]);
    };

    fetchProfileData();
  }, []);

  if (!profileData) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.pageBackground}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.banner}>
            <button style={styles.cameraBtn}>📷</button>
            <div style={styles.avatarContainer}>
              <img
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${profileData.ps_username}`}
                alt="Profile"
                style={styles.avatar}
              />
              <button style={styles.avatarCameraBtn}>📷</button>
            </div>
          </div>

          <div style={styles.cardContent}>
            <h1 style={styles.username}>{profileData.ps_username}</h1>
            <p style={styles.location}>📍 District Court, City Name</p>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Personal Information</h2>
              <div style={styles.grid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name</label>
                  <div style={styles.inputWithIcon}>
                    <input
                      type="text"
                      defaultValue={profileData.ps_name}
                      style={styles.input}
                    />
                    <button style={styles.iconBtn}>👤</button>
                  </div>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email</label>
                  <div style={styles.inputWithIcon}>
                    <input
                      type="email"
                      defaultValue={profileData.ps_email}
                      style={styles.input}
                    />
                    <button style={styles.iconBtn}>📧</button>
                  </div>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <div style={styles.inputWithIcon}>
                    <input
                      type="tel"
                      defaultValue={profileData.ps_contactnumber}
                      style={styles.input}
                    />
                    <button style={styles.iconBtn}>📞</button>
                  </div>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Designation</label>
                  <input
                    type="text"
                    defaultValue="Public Safety Officer"
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>About</h2>
              <textarea
                style={styles.textarea}
                placeholder="Write something about yourself..."
                defaultValue="Dedicated Public Safety Officer with experience in maintaining public order and ensuring community safety. Specialized in case management and emergency response."
              />
            </div>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Additional Details</h2>
              <div style={styles.grid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Badge Number</label>
                  <input
                    type="text"
                    defaultValue={profileData.WBP_ID}
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Department</label>
                  <input
                    type="text"
                    defaultValue="Public Safety Department"
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Join Date</label>
                  <input
                    type="date"
                    defaultValue="2019-01-01"
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Shift</label>
                  <input
                    type="text"
                    defaultValue="Day Shift (9:00 AM - 5:00 PM)"
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            <div style={styles.buttonContainer}>
              <button style={styles.saveButton}>Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageBackground: {
    minHeight: '100vh',
    // background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
    padding: '2rem 0',
    fontFamily: 'Arial, sans-serif',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 1rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    overflow: 'hidden',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
  },
  banner: {
    height: '200px',
    background: 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
    position: 'relative',
  },
  cameraBtn: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  avatarContainer: {
    position: 'absolute',
    bottom: '-3rem',
    left: '2rem',
  },
  avatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '4px solid white',
    backgroundColor: 'white',
  },
  avatarCameraBtn: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    background: 'white',
    border: 'none',
    borderRadius: '50%',
    padding: '0.5rem',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
  },
  cardContent: {
    padding: '4rem 2rem 2rem',
  },
  username: {
    margin: '0',
    color: '#333',
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  location: {
    margin: '0.5rem 0 0',
    color: '#666',
  },
  section: {
    marginTop: '2rem',
  },
  sectionTitle: {
    color: '#2575fc',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    borderBottom: '2px solid #2575fc',
    paddingBottom: '0.5rem',
    marginBottom: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '0.5rem',
    color: '#666',
  },
  input: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '0.25rem',
    fontSize: '1rem',
    width: '100%',
  },
  inputWithIcon: {
    display: 'flex',
  },
  iconBtn: {
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderLeft: 'none',
    padding: '0 0.5rem',
    fontSize: '1rem',
    cursor: 'pointer',
    borderTopRightRadius: '0.25rem',
    borderBottomRightRadius: '0.25rem',
  },
  textarea: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '0.25rem',
    fontSize: '1rem',
    width: '100%',
    minHeight: '100px',
    resize: 'vertical',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '2rem',
  },
  saveButton: {
    background: 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    transition: 'transform 0.1s ease-in-out',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.5rem',
    color: 'white',
    background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
  },
};

export default ProfilePage;

