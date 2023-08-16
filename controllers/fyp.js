import mysql from 'mysql2/promise';

export const fypRegister = async (req, res) => {
  console.log(req.body);
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'fypdba',
    database: 'testdb1',
    password: 'fyp123',
  });

  const {
    names,
    registrationNumbers,
    projectTitle,
    principalSupervisor,
    coSupervisor,
    projectRequirements,
    projectBrief,
    additionalComments,
  } = req.body;

  try {
    const [students] = await pool.query(
      'SELECT regNo FROM Student WHERE regNo IN (?)',
      [registrationNumbers]
    );

    if (students.length !== registrationNumbers.length) {
      let missingStudents = registrationNumbers.filter(
        (reg) => !students.find((std) => std.regNo === reg)
      );
      return res.status(400).json({
        error: `Student(s) ${missingStudents.join(
          ', '
        )} do not exist in the system.`,
      });
    }

    const [projects] = await pool.query(
      'SELECT regNo FROM Project_Student WHERE regNo IN (?)',
      [registrationNumbers]
    );

    // const [result] = await pool.query(
    //   'SELECT regNo FROM PendingApproval_Student WHERE regNo In (?)',
    //   [registrationNumbers]
    // );
    // console.log(result);

    if (projects.length > 0) {
      let projectStudents = projects.map((p) => p.regNo);
      return res.status(400).json({
        error: `Student(s) ${projectStudents.join(
          ', '
        )} already have a project linked or Pending approval.`,
      });
    }

    const [rows] = await pool.query(
      'INSERT INTO PendingApproval (ProjectName, supervisor_empID, coSupervisor_empID, ProjectReqs, Brief, Add_Comments) VALUES (?, (SELECT empID FROM Supervisor WHERE name = ?), (SELECT empID FROM Supervisor WHERE name = ?), ?, ?, ?)',
      [
        projectTitle,
        principalSupervisor,
        coSupervisor,
        projectRequirements,
        projectBrief,
        additionalComments,
      ]
    );
    const projectId = rows.insertId;

    for (let reg of registrationNumbers) {
      await pool.query(
        'INSERT INTO PendingApproval_Student (ProjectID, regNo) VALUES (?, ?)',
        [projectId, reg]
      );
    }
    console.log('Project submitted for approval.');
    res.json({ message: 'Project submitted for approval.' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred.' });
    console.error(error);
  }
};

export const addMilestone = async (req, res) => {
  // console.log(req.body);

  const { projectID, title, description, date, time, addedBy } = req.body;
  const pool = {
    host: 'localhost',
    user: 'fypdba',
    password: 'fyp123',
    database: 'testdb1',
  };

  try {
    const connection = await mysql.createConnection(pool);

    await connection.execute(
      'INSERT INTO Timeline (ProjectID, TimelineTitle, timelineDescription, studentID, studentName) VALUES (?, ?, ?, ?, (SELECT name from Student WHERE regNo = ?))',
      [projectID, title, description, addedBy, addedBy]
    );

    res.status(200).json({ message: 'Milestone added to the timeline' });
  } catch (e) {
    console.log(e);
  } finally {
    if (connection) connection.end();
  }
};

export const addMeeting = async (req, res) => {
  // console.log(req.body);

  const { date, time, supervisor, topic, description, projectID } = req.body;
  const pool = {
    host: 'localhost',
    user: 'fypdba',
    password: 'fyp123',
    database: 'testdb1',
  };

  try {
    const connection = await mysql.createConnection(pool);

    await connection.execute(
      'INSERT INTO Meeting (meetingDate, meetingTime, MeetingTopic, MeetingDescription, userID, projectID) VALUES (?, ?, ?, ?, ?, ?)',
      [date, time, topic, description, '1', projectID]
    );

    res.status(200).json({ message: 'Meeting added to the timeline' });
  } catch (e) {
    console.log(e);
  } finally {
    if (connection) connection.end();
  }
};

export const getPendingProjectsForSupervisor = async (req, res) => {
  const { userID } = req.body; // Assuming empID is passed as a URL parameter

  // console.log('Approvals Controller');

  const pool = {
    host: 'localhost',
    user: 'fypdba',
    password: 'fyp123',
    database: 'testdb1',
  };

  let connection;

  try {
    connection = await mysql.createConnection(pool);

    const [pendingProjects] = await connection.execute(
      'SELECT * FROM PendingApproval WHERE supervisor_empID = ?',
      [userID]
    );

    // console.log('Pending Projects !!!', pendingProjects);

    res.status(200).json({ pendingProjects });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  } finally {
    if (connection) connection.end();
  }
};

export const approveFYP = async (req, res) => {
  const { ProjectID } = req.body;
  const pool = {
    host: 'localhost',
    user: 'fypdba',
    password: 'fyp123',
    database: 'testdb1',
  };
  let connection;

  try {
    connection = await mysql.createConnection(pool);

    // Start a transaction
    await connection.beginTransaction();

    // Insert the project details from the PendingApproval table to the Project table
    const [projectData] = await connection.execute(
      'INSERT INTO Project (ProjectName, supervisor_empID, ProjectReqs, Brief, Add_Comments) SELECT ProjectName, supervisor_empID, ProjectReqs, Brief, Add_Comments FROM PendingApproval WHERE ProjectID = ?',
      [ProjectID]
    );
    console.log('TOOT TOOT');

    // Get the newly created ProjectID from the result of the INSERT operation
    const newProjectID = projectData.insertId;

    // Insert the student details from the PendingApproval_Student table to the Project_Student table
    await connection.execute(
      'INSERT INTO Project_Student (ProjectID, regNo) SELECT ?, regNo FROM PendingApproval_Student WHERE ProjectID = ?',
      [newProjectID, ProjectID]
    );

    // Delete data from the PendingApproval and PendingApproval_Student tables
    await connection.execute(
      'DELETE FROM PendingApproval_Student WHERE ProjectID = ?',
      [ProjectID]
    );

    await connection.execute(
      'DELETE FROM PendingApproval WHERE ProjectID = ?',
      [ProjectID]
    );

    // Commit the transaction
    await connection.commit();

    // Send success response
    res.status(200).json({ message: 'Project Approved Successfully' });
  } catch (err) {
    console.log(err);

    // If an error occurred, rollback the transaction
    if (connection) {
      await connection.rollback();
    }

    res
      .status(500)
      .json({ error: 'An error occurred while approving the project' });
  } finally {
    if (connection) connection.end();
  }
};

export const rejectFYP = async (req, res) => {
  const { ProjectID } = req.body;
  console.log(req.body);

  const pool = {
    host: 'localhost',
    user: 'fypdba',
    password: 'fyp123',
    database: 'testdb1',
  };
  let connection;

  try {
    connection = await mysql.createConnection(pool);

    // Delete data from the PendingApproval and PendingApproval_Student tables
    await connection.execute(
      'DELETE FROM PendingApproval_Student WHERE ProjectID = ?',
      [ProjectID]
    );

    await connection.execute(
      'DELETE FROM PendingApproval WHERE ProjectID = ?',
      [ProjectID]
    );

    // Send success response
    console.log('Project Rejected Successfully');
    res.status(200).json({ message: 'Project Rejected Successfully' });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: 'An error occurred while rejecting the project' });
  } finally {
    if (connection) connection.end();
  }
};
