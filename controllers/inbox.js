import mysql from 'mysql2/promise';

export const loadInbox = async (req, res) => {
  const { userID } = req.body;

  const pool = {
    host: 'localhost',
    user: 'fypdba',
    password: 'fyp123',
    database: 'testdb1',
  };

  let connection;

  try {
    connection = await mysql.createConnection(pool);

    const [rows] = await connection.execute(
      'SELECT * FROM Inbox WHERE userID = ?',
      [userID]
    );

    const [rows2] = await connection.execute(
      'SELECT * FROM Meeting WHERE ProjectID = (SELECT ProjectID FROM Project_Student WHERE regNo = ?)',
      [userID]
    );

    // Transform rows to the desired message format and add messageType
    const transformedMessages = rows.map((message) => ({
      messageID: message.messageID,
      messageTitle: message.messageTitle,
      message: message.message,
      userID: message.userID,
      messageType: 'message', // Added this line
    }));

    // Transform rows2 to the desired message format and add messageType
    const transformedMeetings = rows2.map((meeting) => ({
      messageID: meeting.MeetingID,
      messageTitle: meeting.MeetingTopic,
      message: meeting.MeetingDescription,
      userID: meeting.userID,
      messageType: 'meeting', // Added this line
    }));

    // Combine transformedMessages with transformedMeetings
    const combinedData = [...transformedMessages, ...transformedMeetings];

    console.log(combinedData);

    // Send the combined data as response
    res.status(200).json({ inbox: combinedData });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  } finally {
    if (connection) connection.end();
  }
};

export const loadSupervisorInbox = async (req, res) => {
  const { userID } = req.body;
  //   console.log(userID);

  const pool = {
    host: 'localhost',
    user: 'fypdba',
    password: 'fyp123',
    database: 'testdb1',
  };

  let connection;

  try {
    connection = await mysql.createConnection(pool);

    const [rows] = await connection.execute(
      'SELECT * FROM Inbox WHERE userID = ?',
      [userID]
    );

    const [rows2] = await connection.execute(
      'SELECT * FROM Meeting WHERE ProjectID IN (SELECT ProjectID FROM Project WHERE supervisor_empID = ?)',
      [userID]
    );

    // Transform rows to the desired message format and add messageType
    const transformedMessages = rows.map((message) => ({
      messageID: message.messageID,
      messageTitle: message.messageTitle,
      message: message.message,
      userID: message.userID,
      messageType: 'message', // Added this line
    }));

    // Transform rows2 to the desired meeting format and add messageType
    const transformedMeetings = rows2.map((meeting) => ({
      messageID: meeting.MeetingID,
      messageTitle: meeting.MeetingTopic,
      message: meeting.MeetingDescription,
      userID: meeting.userID,
      messageType: 'meeting', // Added this line
    }));

    // Combine transformedMessages with transformedMeetings
    const combinedData = [...transformedMessages, ...transformedMeetings];

    // console.log(combinedData);

    // Send the combined data as response
    res.status(200).json({ inbox: combinedData });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  } finally {
    if (connection) connection.end();
  }
};
