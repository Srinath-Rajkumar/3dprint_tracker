// backend/controllers/projectController.js
import asyncHandler from 'express-async-handler';
import Project from '../models/Project.js';
import PrintJob from '../models/PrintJob.js'; // To calculate project stats
import CostSettings from '../models/CostSettings.js';

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
  const { projectName, orderId, startDate } = req.body;

  const project = new Project({
    projectName,
    orderId,
    startDate: startDate || Date.now(),
    createdBy: req.user._id, // User who created the project
  });

  const createdProject = await project.save();
  res.status(201).json(createdProject);
});

// @desc    Get all projects (with basic info and stats)
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({}).populate('createdBy', 'name email').sort({ createdAt: -1 });
  
  // Enhance projects with calculated data
  const costSettings = await CostSettings.getSettings();

  const projectsWithStats = await Promise.all(projects.map(async (project) => {
    const jobs = await PrintJob.find({ project: project._id });
    let totalPrintTimeSeconds = 0;
    let totalFilamentUsedGrams = 0;
    let durationDays = 0;

    jobs.forEach(job => {
        if (job.status === 'completed' && job.actualPrintTimeSeconds) {
            totalPrintTimeSeconds += job.actualPrintTimeSeconds;
            totalFilamentUsedGrams += job.weightGrams || 0;
        }
    });
    
    if (project.endDate && project.startDate) {
        durationDays = Math.ceil((project.endDate.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24));
    } else if (project.startDate && project.status === 'ongoing') {
        durationDays = Math.ceil((new Date().getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24));
    }


    const costByTime = (totalPrintTimeSeconds / 60) * costSettings.pricePerMinute;
    const costByFilament = totalFilamentUsedGrams * costSettings.pricePerGramFilament;

    return {
        ...project.toObject(),
        totalPrintTimeSeconds,
        totalFilamentUsedGrams,
        costByTime: parseFloat(costByTime.toFixed(2)),
        costByFilament: parseFloat(costByFilament.toFixed(2)),
        durationDays
    };
  }));


  res.json(projectsWithStats);
});

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('createdBy', 'name email');
  
  if (project) {
    // Optionally, add detailed stats similar to getProjects if needed on this single view
    const costSettings = await CostSettings.getSettings();
    const jobs = await PrintJob.find({ project: project._id });
    let totalPrintTimeSeconds = 0;
    let totalFilamentUsedGrams = 0;

    jobs.forEach(job => {
        if (job.status === 'completed' && job.actualPrintTimeSeconds) {
            totalPrintTimeSeconds += job.actualPrintTimeSeconds;
            totalFilamentUsedGrams += job.weightGrams || 0;
        }
    });

    const costByTime = (totalPrintTimeSeconds / 60) * costSettings.pricePerMinute;
    const costByFilament = totalFilamentUsedGrams * costSettings.pricePerGramFilament;

    res.json({
        ...project.toObject(),
        totalPrintTimeSeconds,
        totalFilamentUsedGrams,
        costByTime: parseFloat(costByTime.toFixed(2)),
        costByFilament: parseFloat(costByFilament.toFixed(2)),
    });
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (or Admin only for certain fields like status, endDate)
const updateProject = asyncHandler(async (req, res) => {
  const { projectName, orderId, startDate, endDate, status } = req.body;
  const project = await Project.findById(req.params.id);

  if (project) {
    project.projectName = projectName || project.projectName;
    project.orderId = orderId || project.orderId;
    project.startDate = startDate || project.startDate;
    project.endDate = endDate || project.endDate;
    project.status = status || project.status;

    // If setting to completed, and no endDate is provided, set it to now
    if (status === 'completed' && !project.endDate) {
        project.endDate = Date.now();
    }


    const updatedProject = await project.save();
    res.json(updatedProject);
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (project) {
    // Also delete associated print jobs and parts (or handle as per business logic)
    await PrintJob.deleteMany({ project: project._id });
    // await Part.deleteMany({ project: project._id }); // If you have a Part model linked directly to Project and not just through PrintJob

    await Project.deleteOne({ _id: project._id });
    res.json({ message: 'Project and associated data removed' });
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});

export { createProject, getProjects, getProjectById, updateProject, deleteProject };