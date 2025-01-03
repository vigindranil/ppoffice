import { serverUrl } from '@/app/constants';

export async function addPPUser(data) {
  try {
    const token = sessionStorage.getItem('token');
    console.log(token);
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

    const response = await fetch(`${serverUrl}/api/addppUser`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('Error adding PP User:', error);
    throw error;
  }
}

export async function getPPUser(data) {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'No authorization token found.' };
    }

    const response = await fetch(`${serverUrl}/api/getppuser?EntryuserID=2`, {
      headers: {
        'Authorization': 'Bearer '+token
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error adding PP User:', error);
    throw error;
  }
}


export async function POST(request) {
  const { PSUserId } = await request.json()

  // In a real application, you would fetch this data from your database
  const userData = {
    ps_id: 54,
    ps_name: "sunil-125",
    ps_username: "sunil chetril",
    ps_email: "vyoma.doe@example.com",
    ps_contactnumber: 9433364965,
    WBP_ID: "WB/RQ/RS/978"
  }

  if (PSUserId === userData.ps_id) {
    return NextResponse.json({
      status: 0,
      message: "Data found",
      data: [userData]
    })
  } else {
    return NextResponse.json({
      status: 1,
      message: "User not found",
      data: []
    }, { status: 404 })
  }
}

