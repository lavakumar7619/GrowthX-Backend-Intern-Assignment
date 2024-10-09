const Assignment = require('../models/assignmentModel');

// View assignments tagged to the admin
exports.getAssignments = async (req, res) => {
  try {
    // Fetch assignments where admin is the logged-in user, selecting specific fields
    const assignments = await Assignment.find({ admin: req.user.id })
      .populate('userId', 'userEmail userName') 
      .select('task userId status createdAt updatedAt'); 

      const formattedAssignments = assignments.map(assignment => ({
        TaskId: assignment._id,
        task: assignment.task,
        userName: assignment.userId.userName,
        status: assignment.status,
        createdAt: new Date(assignment.createdAt).toLocaleString('en-IN', {
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit',
          hour12: true 
        }),
        updatedAt: new Date(assignment.updatedAt).toLocaleString('en-IN', {
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      }));
      

    res.json(formattedAssignments);
  } catch (err) {
    console.error(err); 
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

// Accept an assignment
exports.acceptAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    assignment.status = 'Accepted';
    await assignment.save();
    res.json({ message: 'Assignment accepted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept assignment' });
  }
};

// Reject an assignment
exports.rejectAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    assignment.status = 'Rejected';
    await assignment.save();
    res.json({ message: 'Assignment rejected' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject assignment' });
  }
};
